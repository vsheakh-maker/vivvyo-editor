package com.example.vivvyo.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [ExportedItemEntity::class, StudioProjectEntity::class],
    version = 1,
    exportSchema = false
)
abstract class VivvyoDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao

    companion object {
        @Volatile
        private var INSTANCE: VivvyoDatabase? = null

        fun getDatabase(context: Context): VivvyoDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    VivvyoDatabase::class.java,
                    "vivvyo_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
