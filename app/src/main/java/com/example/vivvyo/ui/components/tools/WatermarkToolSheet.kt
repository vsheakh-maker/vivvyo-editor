package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BrandingWatermark
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
import com.example.vivvyo.model.WatermarkPosition
import com.example.vivvyo.model.WatermarkSettings
import com.example.vivvyo.ui.theme.*

@Composable
fun WatermarkToolSheet(
    settings: WatermarkSettings,
    onUpdateSettings: (WatermarkSettings) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var text by remember(settings.text) { mutableStateOf(settings.text) }
    var position by remember(settings.position) { mutableStateOf(settings.position) }
    var opacity by remember(settings.opacity) { mutableFloatStateOf(settings.opacity) }
    var hasBg by remember(settings.hasBackground) { mutableStateOf(settings.hasBackground) }

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
                    Icon(imageVector = Icons.Default.BrandingWatermark, contentDescription = null, tint = AccentAmber)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Watermark & Branding",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Text input
            OutlinedTextField(
                value = text,
                onValueChange = {
                    text = it
                    onUpdateSettings(settings.copy(text = it))
                },
                placeholder = { Text("e.g. @my_tiktok_handle or Channel Name") },
                singleLine = true,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("watermark_input"),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryNeon,
                    unfocusedBorderColor = StudioCardBorder
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Position selector
            Text("Position On Canvas:", style = MaterialTheme.typography.labelMedium.copy(color = TextSecondary))
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(WatermarkPosition.values()) { pos ->
                    val isSel = pos == position
                    Surface(
                        color = if (isSel) AccentAmber.copy(alpha = 0.2f) else StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .height(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.5.dp, if (isSel) AccentAmber else Color.Transparent, RoundedCornerShape(10.dp))
                            .clickable {
                                position = pos
                                onUpdateSettings(settings.copy(position = pos))
                            }
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 10.dp)) {
                            Text(
                                text = pos.title,
                                fontSize = 11.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSel) AccentAmber else TextPrimary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Opacity Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Opacity:", style = MaterialTheme.typography.labelMedium)
                Text("${(opacity * 100).toInt()}%", color = AccentCyan, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = opacity,
                onValueChange = {
                    opacity = it
                    onUpdateSettings(settings.copy(opacity = it))
                },
                valueRange = 0.2f..1.0f,
                colors = SliderDefaults.colors(thumbColor = AccentCyan, activeTrackColor = AccentCyan)
            )

            // Background pill switch
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Dark Background Tag", style = MaterialTheme.typography.labelMedium)
                Switch(
                    checked = hasBg,
                    onCheckedChange = {
                        hasBg = it
                        onUpdateSettings(settings.copy(hasBackground = it))
                    },
                    colors = SwitchDefaults.colors(checkedThumbColor = AccentAmber, checkedTrackColor = AccentAmber.copy(alpha = 0.5f))
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

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
