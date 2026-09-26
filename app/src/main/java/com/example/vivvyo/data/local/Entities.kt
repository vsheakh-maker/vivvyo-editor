package com.example.vivvyo.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "exported_items")
data class ExportedItemEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val type: String, // "video", "audio", "image"
    val filePath: String,
    val fileSizeBytes: Long,
    val durationSeconds: Float,
    val format: String,
    val toolUsed: String,
    val thumbnailUrl: String,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "studio_projects")
data class StudioProjectEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val projectName: String,
    val videoId: String,
    val videoTitle: String,
    val filterType: String,
    val aspectRatio: String,
    val speed: Float,
    val trimStart: Float,
    val trimEnd: Float,
    val watermarkText: String,
    val updatedAt: Long = System.currentTimeMillis()
)
