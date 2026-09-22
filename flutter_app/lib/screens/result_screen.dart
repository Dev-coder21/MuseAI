import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../theme/app_theme.dart';
import '../models/music_result.dart';
import '../services/api_service.dart';
import '../services/audio_player_service.dart';
import '../widgets/glass_card.dart';
import '../widgets/waveform_painter.dart';

class ResultScreen extends StatefulWidget {
  final MusicResult result;

  const ResultScreen({super.key, required this.result});

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  late AudioPlayerService _audioPlayer;
  late MusicResult _currentResult;
  bool _isRegenerating = false;
  String? _downloadMessage;

  @override
  void initState() {
    super.initState();
    _currentResult = widget.result;
    _audioPlayer = AudioPlayerService();
    _audioPlayer.addListener(_onAudioStateChange);
  }

  void _onAudioStateChange() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _audioPlayer.removeListener(_onAudioStateChange);
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _togglePlayPause() async {
    final fullUrl = ApiService.getFullUrl(_currentResult.audioUrl);
    if (_audioPlayer.isPlaying) {
      await _audioPlayer.pause();
    } else {
      await _audioPlayer.play(fullUrl);
    }
  }

  Future<void> _handleRegenerate() async {
    setState(() => _isRegenerating = true);
    await _audioPlayer.stop();

    try {
      final newResult = await ApiService().regenerateMusic(_currentResult.generationId);
      if (!mounted) return;
      setState(() {
        _currentResult = newResult;
        _isRegenerating = false;
        _downloadMessage = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isRegenerating = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Regeneration failed: $e')),
      );
    }
  }

  Future<void> _handleDownload() async {
    try {
      final url = ApiService.getFullUrl(_currentResult.audioUrl);
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final dir = await getDownloadsDirectory() ?? await getApplicationDocumentsDirectory();
        final filePath = '${dir.path}/museai_${_currentResult.generationId}.wav';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);

        setState(() {
          _downloadMessage = 'Saved to: $filePath';
        });

        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.secondary,
            content: Text('Saved audio to $filePath'),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Download failed: $e')),
      );
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final progress = _audioPlayer.duration.inMilliseconds > 0
        ? (_audioPlayer.position.inMilliseconds / _audioPlayer.duration.inMilliseconds)
            .clamp(0.0, 1.0)
        : 0.0;

    final fullSpectrogramUrl = ApiService.getFullUrl(_currentResult.spectrogramUrl);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Composed Result'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_rounded),
            tooltip: 'Download Audio WAV',
            onPressed: _handleDownload,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Info Card
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.auto_awesome, color: AppTheme.secondary),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _currentResult.originalPrompt.isNotEmpty
                              ? _currentResult.originalPrompt
                              : 'AI Composition',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Final Generation Prompt:',
                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _currentResult.finalPrompt,
                    style: const TextStyle(
                      fontSize: 13,
                      fontStyle: FontStyle.italic,
                      color: AppTheme.secondary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Audio Player & Interactive Waveform Card
            GlassCard(
              child: Column(
                children: [
                  const Text(
                    'Audio Playback & Waveform',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Custom Waveform Widget
                  SizedBox(
                    height: 80,
                    width: double.infinity,
                    child: CustomPaint(
                      painter: WaveformPainter(
                        points: _currentResult.waveformPoints,
                        progress: progress,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Seek Slider
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppTheme.secondary,
                      inactiveTrackColor: AppTheme.border,
                      thumbColor: Colors.white,
                      trackHeight: 3,
                    ),
                    child: Slider(
                      value: progress,
                      onChanged: (val) {
                        final newPos = Duration(
                          milliseconds: (_audioPlayer.duration.inMilliseconds * val).toInt(),
                        );
                        _audioPlayer.seek(newPos);
                      },
                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatDuration(_audioPlayer.position),
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                        Text(
                          _formatDuration(_audioPlayer.duration.inMilliseconds > 0
                              ? _audioPlayer.duration
                              : Duration(seconds: _currentResult.durationSeconds.toInt())),
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Play Controls
                  IconButton(
                    iconSize: 56,
                    icon: Icon(
                      _audioPlayer.isPlaying
                          ? Icons.pause_circle_filled_rounded
                          : Icons.play_circle_fill_rounded,
                      color: AppTheme.primary,
                    ),
                    onPressed: _togglePlayPause,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Spectrogram Image Card
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Audio Spectrogram (Frequency vs Time)',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      fullSpectrogramUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: 180,
                      errorBuilder: (_, __, ___) => const Center(
                        child: Text(
                          'Spectrogram loading...',
                          style: TextStyle(color: AppTheme.textSecondary),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Generation Metadata Chips
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Technical Details',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildChip(Icons.memory, 'Device: ${_currentResult.device.toUpperCase()}'),
                      _buildChip(Icons.timer, 'Gen Time: ${_currentResult.generationTimeSeconds}s'),
                      _buildChip(Icons.graphic_eq, 'SR: ${_currentResult.samplingRate} Hz'),
                      _buildChip(Icons.audiotrack, 'Duration: ${_currentResult.durationSeconds}s'),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Action Buttons (Regenerate & Download)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isRegenerating ? null : _handleRegenerate,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.cardBg,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppTheme.border),
                      ),
                    ),
                    icon: _isRegenerating
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.refresh_rounded, color: Colors.white),
                    label: Text(
                      _isRegenerating ? 'Regenerating...' : 'Regenerate',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _handleDownload,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: const Icon(Icons.download_rounded, color: Colors.white),
                    label: const Text('Download WAV', style: TextStyle(color: Colors.white)),
                  ),
                ),
              ],
            ),

            if (_downloadMessage != null) ...[
              const SizedBox(height: 12),
              Text(
                _downloadMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: AppTheme.secondary),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppTheme.secondary),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.white)),
        ],
      ),
    );
  }
}
