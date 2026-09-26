package com.example.vivvyo.ui.components.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Collections
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
import com.example.vivvyo.model.SlideshowImage
import com.example.vivvyo.ui.theme.*

@Composable
fun SlideshowToolSheet(
    onGenerateSlideshow: (List<SlideshowImage>, Float) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    var slideDuration by remember { mutableFloatStateOf(2.5f) }
    var selectedImages by remember { mutableStateOf(SampleData.SAMPLE_SLIDESHOW_IMAGES) }

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
                    Icon(imageVector = Icons.Default.Collections, contentDescription = null, tint = PrimaryNeon)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Photo Slideshow Generator",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                }
                IconButton(onClick = onClose) {
                    Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text("Transform a collection of photos into a rhythmic TikTok video:", style = MaterialTheme.typography.bodyMedium.copy(color = TextSecondary))

            Spacer(modifier = Modifier.height(14.dp))

            // Photos Carousel
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(selectedImages) { img ->
                    Surface(
                        color = StudioSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .width(90.dp)
                            .height(80.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(1.dp, StudioCardBorder, RoundedCornerShape(10.dp))
                    ) {
                        AsyncImage(
                            model = img.url,
                            contentDescription = img.title,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Slide Duration Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Seconds Per Slide:", style = MaterialTheme.typography.labelMedium)
                Text("${String.format("%.1f", slideDuration)}s", color = PrimaryNeonLight, fontWeight = FontWeight.Bold)
            }
            Slider(
                value = slideDuration,
                onValueChange = { slideDuration = it },
                valueRange = 1.0f..5.0f,
                colors = SliderDefaults.colors(thumbColor = PrimaryNeon, activeTrackColor = PrimaryNeon)
            )

            Spacer(modifier = Modifier.height(14.dp))

            Button(
                onClick = {
                    onGenerateSlideshow(selectedImages, slideDuration)
                    onClose()
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
                    .testTag("create_slideshow_button")
            ) {
                Text("Render Slideshow Video (${(selectedImages.size * slideDuration).toInt()}s)", fontWeight = FontWeight.Bold)
            }
        }
    }
}
