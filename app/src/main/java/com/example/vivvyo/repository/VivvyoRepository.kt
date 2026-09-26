package com.example.vivvyo.repository

import com.example.vivvyo.data.local.ExportedItemEntity
import com.example.vivvyo.data.local.ProjectDao
import com.example.vivvyo.data.local.StudioProjectEntity
import kotlinx.coroutines.flow.Flow

class VivvyoRepository(private val dao: ProjectDao) {

    val allExportedItems: Flow<List<ExportedItemEntity>> = dao.getAllExportedItems()
    val allProjects: Flow<List<StudioProjectEntity>> = dao.getAllProjects()

    suspend fun saveExportedItem(item: ExportedItemEntity): Long {
        return dao.insertExportedItem(item)
    }

    suspend fun deleteExportedItem(item: ExportedItemEntity) {
        dao.deleteExportedItem(item)
    }

    suspend fun deleteExportedItemById(id: Long) {
        dao.deleteExportedItemById(id)
    }

    suspend fun saveProject(project: StudioProjectEntity): Long {
        return dao.insertProject(project)
    }

    suspend fun deleteProjectById(id: Long) {
        dao.deleteProjectById(id)
    }
}
