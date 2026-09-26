package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.vivvyo.data.SampleData
import com.example.vivvyo.model.AudioSettings
import com.example.vivvyo.model.TikTokSong
import com.example.vivvyo.ui.theme.*

@Composable
fun AudioMixerToolSheet(
    settings: AudioSettings,
    onUpdateSettings: (AudioSettings) -> Unit,
    onSelectSong: (TikTokSong) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var videoVol by remember(settings.videoVolume) { mutableFloatStateOf(settings.videoVolume) }
    var bgmVol by remember(settings.bgmVolume) { mutableFloatStateOf(settings.bgmVolume) }
    var isMuted by remember(settings.muted) { mutableStateOf(settings.muted) }
    var selectedCategory by remember { mutableStateOf("all") }

    val categories = listOf("all", "viral", "phonk", "dance", "lofi", "aesthetic", "speedup")

    val filteredSongs = remember(selectedCategory) {
        if (selectedCategory == "all") SampleData.TIKTOK_TRENDING_SONGS
        else SampleData.TIKTOK_TRENDING_SONGS.filter { it.category == selectedCategory }
    }

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
                    Icon(imageVector = Icons.Default.MusicNote, contentDescription = null, tint = PrimaryNeonLight)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Audio Mixer & Viral TikTok Songs",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Volume Controls Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Original Video Audio
                Surface(
                    color = StudioSurfaceVariant,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Clip Audio", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            IconButton(
                                onClick = {
                                    isMuted = !isMuted
                                    onUpdateSettings(settings.copy(muted = isMuted))
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                                    contentDescription = "Mute",
                                    tint = if (isMuted) Color.Red else PrimaryNeon,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                        Slider(
                            value = videoVol,
                            onValueChange = {
                                videoVol = it
                                onUpdateSettings(settings.copy(videoVolume = it))
                            },
                            valueRange = 0f..1f,
                            enabled = !isMuted,
                            colors = SliderDefaults.colors(thumbColor = PrimaryNeon, activeTrackColor = PrimaryNeon)
                        )
                    }
                }

                // Background Music Volume
                Surface(
                    color = StudioSurfaceVariant,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("BGM Track", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                            Text("${(bgmVol * 100).toInt()}%", color = AccentPink, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Slider(
                            value = bgmVol,
                            onValueChange = {
                                bgmVol = it
                                onUpdateSettings(settings.copy(bgmVolume = it))
                            },
                            valueRange = 0f..1f,
                            colors = SliderDefaults.colors(thumbColor = AccentPink, activeTrackColor = AccentPink)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Genre Selector
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(categories) { cat ->
                    val isSel = selectedCategory == cat
                    Surface(
                        color = if (isSel) PrimaryNeon else StudioSurfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .height(26.dp)
                            .clickable { selectedCategory = cat }
                    ) {
                        Text(
                            text = cat.uppercase(),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSel) Color.White else TextSecondary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Trending Song List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
            ) {
                items(filteredSongs) { song ->
                    val isCurrent = settings.bgmTrackId == song.id
                    Surface(
                        color = if (isCurrent) PrimaryNeon.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .border(1.dp, if (isCurrent) AccentCyan else Color.Transparent, RoundedCornerShape(8.dp))
                            .clickable { onSelectSong(song) }
                            .testTag("song_${song.id}")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(8.dp)
                        ) {
                            AsyncImage(
                                model = song.coverUrl,
                                contentDescription = song.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(6.dp))
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = song.title,
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isCurrent) AccentCyan else TextPrimary
                                    )
                                )
                                Text(
                                    text = "${song.artist} • ${song.views} uses",
                                    style = MaterialTheme.typography.labelSmall.copy(color = TextMuted)
                                )
                            }
                            if (isCurrent) {
                                Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(20.dp))
                            } else {
                                Icon(imageVector = Icons.Default.AddCircleOutline, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(20.dp))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                onClick = onClose,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(42.dp)
            ) {
                Text("Done", fontWeight = FontWeight.Bold)
            }
        }
    }
}
