package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterVintage
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vivvyo.model.FilterType
import com.example.vivvyo.ui.theme.*

@Composable
fun FilterToolSheet(
    currentFilter: FilterType,
    intensity: Float,
    onSelectFilter: (FilterType, Float) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var filterIntensity by remember(intensity) { mutableFloatStateOf(intensity) }

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
                    Icon(imageVector = Icons.Default.FilterVintage, contentDescription = null, tint = AccentPink)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Visual Grading & Color Presets",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Intensity Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Filter Intensity:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
                Text("${filterIntensity.toInt()}%", color = AccentPink, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = filterIntensity,
                onValueChange = {
                    filterIntensity = it
                    onSelectFilter(currentFilter, it)
                },
                valueRange = 0f..100f,
                colors = SliderDefaults.colors(thumbColor = AccentPink, activeTrackColor = AccentPink)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Filter List Carousel
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(FilterType.values()) { filter ->
                    val isSelected = filter == currentFilter

                    Surface(
                        color = if (isSelected) PrimaryNeon.copy(alpha = 0.25f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .width(86.dp)
                            .height(76.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(
                                1.5.dp,
                                if (isSelected) AccentPink else Color.Transparent,
                                RoundedCornerShape(10.dp)
                            )
                            .clickable { onSelectFilter(filter, filterIntensity) }
                            .testTag("filter_${filter.name.lowercase()}")
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                            modifier = Modifier.padding(6.dp)
                        ) {
                            Surface(
                                color = Color(filter.badgeColorHex),
                                shape = RoundedCornerShape(6.dp),
                                modifier = Modifier.size(24.dp)
                            ) {}
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = filter.displayName,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) AccentPink else TextPrimary
                                ),
                                textAlign = TextAlign.Center,
                                maxLines = 1
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onClose,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text("Done", fontWeight = FontWeight.Bold)
            }
        }
    }
}
