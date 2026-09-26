package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MusicNote
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
import com.example.vivvyo.model.VideoTemplate
import com.example.vivvyo.ui.theme.*

@Composable
fun TemplatesModalSheet(
    onApplyTemplate: (VideoTemplate) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedCategory by remember { mutableStateOf("all") }
    val categories = listOf("all", "viral", "aesthetic", "retro", "fitness", "travel")

    val filteredTemplates = remember(selectedCategory) {
        if (selectedCategory == "all") SampleData.VIDEO_TEMPLATES
        else SampleData.VIDEO_TEMPLATES.filter { it.category == selectedCategory }
    }

    Surface(
        color = StudioSurface,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
        modifier = modifier
            .fillMaxWidth()
            .height(540.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, tint = AccentAmber)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Trending TikTok Video Templates",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Text("1-tap recipes syncing filters, viral songs, aspect ratios & text hook:", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))

            Spacer(modifier = Modifier.height(10.dp))

            // Categories
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
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

            Spacer(modifier = Modifier.height(12.dp))

            // Templates list
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth().weight(1f)
            ) {
                items(filteredTemplates) { tpl ->
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.dp, StudioCardBorder, RoundedCornerShape(12.dp))
                            .clickable { onApplyTemplate(tpl) }
                            .testTag("template_${tpl.id}")
                    ) {
                        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(modifier = Modifier.size(76.dp).clip(RoundedCornerShape(8.dp))) {
                                AsyncImage(
                                    model = tpl.previewImageUrl,
                                    contentDescription = tpl.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                                Surface(
                                    color = Color.Black.copy(alpha = 0.7f),
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.align(Alignment.TopStart).padding(3.dp)
                                ) {
                                    Text(tpl.badge, fontSize = 8.sp, color = AccentAmber, fontWeight = FontWeight.Bold, modifier = Modifier.padding(2.dp))
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(tpl.title, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold, color = TextPrimary))
                                Text(tpl.subtitle, style = MaterialTheme.typography.bodySmall.copy(color = TextMuted), maxLines = 1)
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(imageVector = Icons.Default.MusicNote, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Viral BGM • ${tpl.aspectRatio.label} • ${tpl.speed}x", style = MaterialTheme.typography.labelSmall.copy(color = AccentCyan))
                                }
                            }
                            Button(
                                onClick = { onApplyTemplate(tpl) },
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text("Use", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
