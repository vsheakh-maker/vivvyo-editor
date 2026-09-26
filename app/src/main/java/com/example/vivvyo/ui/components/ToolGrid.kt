package com.example.vivvyo.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.model.ToolType
import com.example.vivvyo.ui.theme.*

data class ToolItemData(
    val type: ToolType,
    val title: String,
    val icon: ImageVector,
    val accentColor: Color,
    val isHot: Boolean = false
)

@Composable
fun ToolGrid(
    onSelectTool: (ToolType) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedCategory by remember { mutableStateOf("All") }
    val categories = listOf("All", "Basics", "Visuals", "Audio", "Text", "Smart")

    val allTools = remember {
        listOf(
            ToolItemData(ToolType.TRIM, "Trim", Icons.Default.ContentCut, PrimaryNeon),
            ToolItemData(ToolType.AUTO_CUT, "Auto-Cut", Icons.Default.FlashOn, AccentAmber, isHot = true),
            ToolItemData(ToolType.CROP, "Crop & Ratio", Icons.Default.Crop, AccentCyan),
            ToolItemData(ToolType.FILTER, "Filters", Icons.Default.FilterVintage, AccentPink, isHot = true),
            ToolItemData(ToolType.AUDIO, "Audio Mixer", Icons.Default.MusicNote, PrimaryNeonLight),
            ToolItemData(ToolType.SPEED, "Speed", Icons.Default.Speed, AccentAmber),
            ToolItemData(ToolType.TRANSFORM, "Rotate & Flip", Icons.Default.RotateRight, AccentCyan),
            ToolItemData(ToolType.TRANSITION, "Transitions", Icons.Default.Transform, AccentPink),
            ToolItemData(ToolType.JOINER, "Merge Clips", Icons.Default.VideoCall, PrimaryNeon),
            ToolItemData(ToolType.SUBTITLES, "Captions", Icons.Default.Subtitles, AccentAmber, isHot = true),
            ToolItemData(ToolType.STICKERS, "Stickers", Icons.Default.EmojiEmotions, AccentPink),
            ToolItemData(ToolType.COMPRESS, "Compress", Icons.Default.Compress, AccentCyan),
            ToolItemData(ToolType.EXTRACT_AUDIO, "Extract Audio", Icons.Default.Audiotrack, PrimaryNeonLight),
            ToolItemData(ToolType.WATERMARK, "Watermark", Icons.Default.BrandingWatermark, AccentAmber),
            ToolItemData(ToolType.SLIDESHOW, "Slideshow", Icons.Default.Collections, PrimaryNeon),
            ToolItemData(ToolType.TEMPLATES, "Templates", Icons.Default.AutoAwesome, AccentPink, isHot = true),
            ToolItemData(ToolType.BG_REMOVE, "AI Cutout", Icons.Default.AutoFixHigh, AccentCyan, isHot = true),
            ToolItemData(ToolType.FONT_GENERATOR, "Font Studio", Icons.Default.TextFields, PrimaryNeon)
        )
    }

    val filteredTools = remember(selectedCategory) {
        if (selectedCategory == "All") allTools
        else allTools.filter { it.type.category.contains(selectedCategory, ignoreCase = true) }
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(StudioDarkBackground)
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        // Category Filter Chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            categories.forEach { cat ->
                val isSelected = selectedCategory == cat
                Surface(
                    color = if (isSelected) PrimaryNeon else StudioSurfaceVariant,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .height(28.dp)
                        .clickable { selectedCategory = cat }
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = cat,
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = if (isSelected) Color.White else TextSecondary,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        )
                    }
                }
            }
        }

        // Tools 4-Column Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(4),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(210.dp)
        ) {
            items(filteredTools) { tool ->
                Surface(
                    color = StudioSurface,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(70.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, StudioCardBorder, RoundedCornerShape(12.dp))
                        .clickable { onSelectTool(tool.type) }
                        .testTag("tool_${tool.type.name.lowercase()}")
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier.padding(4.dp)
                    ) {
                        if (tool.isHot) {
                            Surface(
                                color = AccentPink,
                                shape = RoundedCornerShape(4.dp),
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(2.dp)
                            ) {
                                Text(
                                    text = "PRO",
                                    fontSize = 7.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 3.dp, vertical = 1.dp)
                                )
                            }
                        }

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = tool.icon,
                                contentDescription = tool.title,
                                tint = tool.accentColor,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = tool.title,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = TextPrimary
                                ),
                                textAlign = TextAlign.Center,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }
    }
}
