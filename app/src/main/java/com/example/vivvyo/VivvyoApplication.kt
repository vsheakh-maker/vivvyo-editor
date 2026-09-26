package com.example.vivvyo

import android.app.Application
import com.example.vivvyo.data.local.VivvyoDatabase

class VivvyoApplication : Application() {
    val database: VivvyoDatabase by lazy {
        VivvyoDatabase.getDatabase(this)
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: VivvyoApplication
            private set
    }
}
