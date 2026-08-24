package com.resqtrace.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public FileStorageService(@Value("${upload.dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Value("${resqtrace.storage.provider:local}")
    private String storageProvider;

    @Value("${resqtrace.storage.s3.bucket:resqtrace-uploads}")
    private String s3Bucket;

    @Value("${resqtrace.storage.s3.region:us-east-1}")
    private String s3Region;

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("Cannot store empty file.");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("File size exceeds limit of 5MB.");

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException("Invalid file type.");
        }

        validateMagicNumbers(file);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown");
        String extension = originalFileName.lastIndexOf('.') > 0 ? originalFileName.substring(originalFileName.lastIndexOf('.')) : "";
        String newFileName = UUID.randomUUID().toString() + extension;

        if ("s3".equalsIgnoreCase(storageProvider)) {
            try {
                software.amazon.awssdk.services.s3.S3Client s3Client = software.amazon.awssdk.services.s3.S3Client.builder()
                        .region(software.amazon.awssdk.regions.Region.of(s3Region))
                        .build();
                
                s3Client.putObject(software.amazon.awssdk.services.s3.model.PutObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(newFileName)
                        .contentType(mimeType)
                        .build(),
                        software.amazon.awssdk.core.sync.RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                
                return "https://" + s3Bucket + ".s3." + s3Region + ".amazonaws.com/" + newFileName;
            } catch (Exception e) {
                throw new RuntimeException("Could not upload to S3", e);
            }
        }

        // Local Storage Fallback
        try {
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/api/uploads/" + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file.", ex);
        }
    }

    public String getLocalPath(String photoUrl) {
        if (photoUrl == null || !photoUrl.startsWith("/api/uploads/")) return null;
        String fileName = photoUrl.substring("/api/uploads/".length());
        return this.fileStorageLocation.resolve(fileName).toString();
    }

    private void validateMagicNumbers(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            if (is.read(header) != -1) {
                if (!isJPEG(header) && !isPNG(header) && !isWEBP(header)) {
                    throw new IllegalArgumentException("Invalid file content.");
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file content for validation", e);
        }
    }

    private boolean isJPEG(byte[] header) {
        return header[0] == (byte) 0xFF && header[1] == (byte) 0xD8;
    }

    private boolean isPNG(byte[] header) {
        return header[0] == (byte) 0x89 && header[1] == (byte) 0x50 && header[2] == (byte) 0x4E && header[3] == (byte) 0x47;
    }

    private boolean isWEBP(byte[] header) {
        return header[0] == (byte) 0x52 && header[1] == (byte) 0x49 && header[2] == (byte) 0x46 && header[3] == (byte) 0x46
                && header[8] == (byte) 0x57 && header[9] == (byte) 0x45 && header[10] == (byte) 0x42 && header[11] == (byte) 0x50;
    }
}
