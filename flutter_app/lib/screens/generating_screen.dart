import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/music_request.dart';
import '../services/api_service.dart';
import '../widgets/glass_card.dart';
import 'result_screen.dart';

class GeneratingScreen extends StatefulWidget {
  final MusicRequest request;

  const GeneratingScreen({super.key, required this.request});

  @override
  State<GeneratingScreen> createState() => _GeneratingScreenState();
}

class _GeneratingScreenState extends State<GeneratingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  final ApiService _apiService = ApiService();
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _startGeneration();
  }

  Future<void> _startGeneration() async {
    try {
      final result = await _apiService.generateMusic(widget.request);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => ResultScreen(result: result),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MuseAI Composer'),
        automaticallyImplyLeading: false,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_errorMessage == null) ...[
                // Animated Pulsating Ring
                AnimatedBuilder(
                  animation: _animController,
                  builder: (context, child) {
                    final scale = 1.0 + (_animController.value * 0.2);
                    return Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [AppTheme.primary, AppTheme.secondary],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primary.withOpacity(0.5),
                              blurRadius: 30 * _animController.value,
                              spreadRadius: 5 * _animController.value,
                            )
                          ],
                        ),
                        child: const Icon(
                          Icons.music_note_rounded,
                          size: 64,
                          color: Colors.white,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 36),
                const Text(
                  'Composing Your Music...',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Meta MusicGen-small is generating ${widget.request.duration}s of audio on Apple M1 GPU',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 32),
                GlassCard(
                  child: Column(
                    children: [
                      const Text(
                        'Prompt',
                        style: TextStyle(
                          color: AppTheme.secondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.request.prompt.isNotEmpty
                            ? '"${widget.request.prompt}"'
                            : 'Custom Musical Preset',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Colors.white,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                const CircularProgressIndicator(
                  color: AppTheme.secondary,
                ),
              ] else ...[
                // Error Display
                const Icon(
                  Icons.error_outline_rounded,
                  color: AppTheme.accent,
                  size: 64,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Composition Failed',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Back to Home'),
                )
              ],
            ],
          ),
        ),
      ),
    );
  }
}
