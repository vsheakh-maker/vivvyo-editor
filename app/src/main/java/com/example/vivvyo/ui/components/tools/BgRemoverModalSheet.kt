package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoFixHigh
import androidx.compose.material.icons.filled.Close
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
import com.example.vivvyo.model.BgRemoverSettings
import com.example.vivvyo.ui.theme.*

@Composable
fun BgRemoverModalSheet(
    settings: BgRemoverSettings,
    onUpdateSettings: (BgRemoverSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var tolerance by remember(settings.tolerance) { mutableFloatStateOf(settings.tolerance) }
    var bgType by remember(settings.backgroundType) { mutableStateOf(settings.backgroundType) }

    val bgTypes = listOf("blur", "transparent", "gradient", "color")

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
                    Icon(imageVector = Icons.Default.AutoFixHigh, contentDescription = null, tint = AccentCyan)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "AI Subject Cutout & Background Replace",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text("Segment foreground subject and replace video background with frosted blur, transparency, or neon gradients.", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))

            Spacer(modifier = Modifier.height(14.dp))

            // Background Type
            Text("Replacement Backdrop:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                bgTypes.forEach { type ->
                    val isSel = type == bgType
                    Surface(
                        color = if (isSel) AccentCyan.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) AccentCyan else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable {
                                bgType = type
                                onUpdateSettings(settings.copy(backgroundType = type))
                            }
                            .testTag("bg_type_$type")
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = type.uppercase(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) AccentCyan else TextPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // AI Mask Tolerance Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("AI Chroma / Edge Tolerance:", style = MaterialTheme.typography.labelMedium)
                Text("${tolerance.toInt()}%", color = AccentCyan, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = tolerance,
                onValueChange = {
                    tolerance = it
                    onUpdateSettings(settings.copy(tolerance = it))
                },
                valueRange = 10f..70f,
                colors = SliderDefaults.colors(thumbColor = AccentCyan, activeTrackColor = AccentCyan)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onClose,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text("Apply AI Background Cutout", fontWeight = FontWeight.Bold)
            }
        }
    }
}
