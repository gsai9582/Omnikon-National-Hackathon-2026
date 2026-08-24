package com.resqtrace.backend.repository;

import com.resqtrace.backend.entity.SearchTask;
import com.resqtrace.backend.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchTaskRepository extends JpaRepository<SearchTask, Long> {
    List<SearchTask> findByAssignedResponderId(Long responderProfileId);
    
    @Query("SELECT MAX(CAST(SUBSTRING(t.taskCode, 10) AS Long)) FROM SearchTask t WHERE t.taskCode LIKE :prefix%")
    Long findMaxSequenceByPrefix(@Param("prefix") String prefix);

    long countByStatus(TaskStatus status);
    
    @Query("SELECT COUNT(t) FROM SearchTask t WHERE t.status IN ('UNASSIGNED', 'ASSIGNED', 'IN_PROGRESS')")
    long countActiveTasks();
}
