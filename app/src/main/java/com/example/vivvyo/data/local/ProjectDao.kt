package com.example.vivvyo.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjectDao {
    @Query("SELECT * FROM exported_items ORDER BY createdAt DESC")
    fun getAllExportedItems(): Flow<List<ExportedItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExportedItem(item: ExportedItemEntity): Long

    @Delete
    suspend fun deleteExportedItem(item: ExportedItemEntity)

    @Query("DELETE FROM exported_items WHERE id = :id")
    suspend fun deleteExportedItemById(id: Long)

    @Query("SELECT * FROM studio_projects ORDER BY updatedAt DESC")
    fun getAllProjects(): Flow<List<StudioProjectEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProject(project: StudioProjectEntity): Long

    @Query("DELETE FROM studio_projects WHERE id = :id")
    suspend fun deleteProjectById(id: Long)
}
