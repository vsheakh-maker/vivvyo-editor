package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.vivvyo.data.SampleData
import com.example.vivvyo.model.VideoAsset
import com.example.vivvyo.ui.theme.*

@Composable
fun VideoJoinerToolSheet(
    initialClips: List<VideoAsset>,
    onMergeClips: (List<VideoAsset>) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var clips by remember { mutableStateOf(initialClips.ifEmpty { listOf(SampleData.SAMPLE_VIDEOS[0], SampleData.SAMPLE_VIDEOS[1]) }) }

    Surface(
        color = StudioSurface,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.VideoCall, contentDescription = null, tint = PrimaryNeon)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Merge & Join Multiple Clips",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text("Reorder, trim, or append video clips onto your multi-track timeline:", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))

            Spacer(modifier = Modifier.height(14.dp))

            // Clips Timeline Strip
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                itemsIndexed(clips) { index, clip ->
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .width(110.dp)
                            .height(95.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.dp, StudioCardBorder, RoundedCornerShape(10.dp))
                    ) {
                        Column(modifier = Modifier.padding(6.dp)) {
                            Box(modifier = Modifier.fillMaxWidth().height(50.dp)) {
                                AsyncImage(
                                    model = clip.thumbnailUrl,
                                    contentDescription = clip.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(6.dp))
                                )
                                Surface(
                                    color = Color.Black.copy(alpha = 0.7f),
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.align(Alignment.BottomEnd).padding(2.dp)
                                ) {
                                    Text("${clip.duration.toInt()}s", fontSize = 9.sp, color = Color.White, modifier = Modifier.padding(2.dp))
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("#${index + 1}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = AccentCyan)
                                if (clips.size > 1) {
                                    IconButton(
                                        onClick = { clips = clips.filterIndexed { i, _ -> i != index } },
                                        modifier = Modifier.size(18.dp)
                                    ) {
                                        Icon(imageVector = Icons.Default.Close, contentDescription = "Remove", tint = Color.Red, modifier = Modifier.size(14.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                // Add Clip button
                item {
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .width(90.dp)
                            .height(95.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .clickable {
                                val nextClip = SampleData.SAMPLE_VIDEOS[(clips.size) % SampleData.SAMPLE_VIDEOS.size]
                                clips = clips + nextClip
                            }
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Icon(imageVector = Icons.Default.AddCircleOutline, contentDescription = "Add", tint = AccentPink, modifier = Modifier.size(24.dp))
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Add Clip", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            Button(
                onClick = {
                    onMergeClips(clips)
                    onClose()
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .testTag("merge_clips_button")
            ) {
                Icon(imageVector = Icons.Default.Done, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Join ${clips.size} Clips Into Timeline", fontWeight = FontWeight.Bold)
            }
        }
    }
}
