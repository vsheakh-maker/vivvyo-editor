package com.example.vivvyo.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.model.VideoAsset
import com.example.vivvyo.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Locale

@Composable
fun CameraRecorderModalSheet(
    onSaveRecording: (VideoAsset) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isRecording by remember { mutableStateOf(false) }
    var recordTimeSeconds by remember { mutableIntStateOf(0) }
    var isFrontCamera by remember { mutableStateOf(false) }
    var isMicOn by remember { mutableStateOf(true) }

    LaunchedEffect(isRecording) {
        if (isRecording) {
            recordTimeSeconds = 0
            while (isRecording) {
                delay(1000)
                recordTimeSeconds += 1
            }
        }
    }

    Surface(
        color = Color.Black,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        modifier = modifier
            .fillMaxWidth()
            .height(520.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            // Camera viewfinder simulation background
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF14141E)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = if (isFrontCamera) Icons.Default.Face else Icons.Default.Videocam,
                        contentDescription = null,
                        tint = TextMuted,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (isFrontCamera) "Front Selfie Camera" else "Rear Ultra-Wide Studio Camera",
                        style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary)
                    )
                }
            }

            // Top Bar: Timer, Close, Settings
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .align(Alignment.TopCenter),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                }

                // Recording Timer Badge
                if (isRecording) {
                    Surface(
                        color = Color.Red,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(Color.White))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = String.format(Locale.US, "%02d:%02d", recordTimeSeconds / 60, recordTimeSeconds % 60),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                } else {
                    Text("Ready To Record", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    IconButton(
                        onClick = { isFrontCamera = !isFrontCamera },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(imageVector = Icons.Default.FlipCameraAndroid, contentDescription = "Switch Camera", tint = Color.White)
                    }

                    IconButton(
                        onClick = { isMicOn = !isMicOn },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = if (isMicOn) Icons.Default.Mic else Icons.Default.MicOff,
                            contentDescription = "Mic",
                            tint = if (isMicOn) Color.White else Color.Red
                        )
                    }
                }
            }

            // Bottom Shutter Controls
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 28.dp)
                    .align(Alignment.BottomCenter),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(CircleShape)
                        .border(3.dp, Color.White, CircleShape)
                        .clickable {
                            if (!isRecording) {
                                isRecording = true
                            } else {
                                isRecording = false
                                // Save recorded video asset
                                val recorded = VideoAsset(
                                    id = "rec-${System.currentTimeMillis()}",
                                    title = "Studio Camera Take (${recordTimeSeconds.coerceAtLeast(1)}s)",
                                    url = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
                                    duration = recordTimeSeconds.coerceAtLeast(3).toFloat(),
                                    thumbnailUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80"
                                )
                                onSaveRecording(recorded)
                                onClose()
                            }
                        }
                        .testTag("record_shutter_button"),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(if (isRecording) 32.dp else 56.dp)
                            .clip(if (isRecording) RoundedCornerShape(8.dp) else CircleShape)
                            .background(Color.Red)
                    )
                }
            }
        }
    }
}
