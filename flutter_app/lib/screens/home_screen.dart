import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/music_request.dart';
import '../services/api_service.dart';
import '../widgets/glass_card.dart';
import 'generating_screen.dart';
import 'history_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _promptController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isBackendConnected = false;

  // Selected Controls
  String? _selectedMood;
  String? _selectedGenre;
  String? _selectedInstrument;
  String? _selectedIntensity;
  String? _selectedTempo;
  String? _selectedPurpose;
  int _durationSeconds = 5;

  bool _showAdvancedControls = false;

  final List<String> _moods = ['Calm', 'Happy', 'Sad', 'Energetic', 'Relaxing', 'Emotional', 'Dark', 'Peaceful'];
  final List<String> _genres = ['Ambient', 'Classical', 'Jazz', 'Electronic', 'Cinematic', 'Lo-fi', 'Acoustic'];
  final List<String> _instruments = ['Piano', 'Guitar', 'Violin', 'Strings', 'Synth', 'Drums', 'Flute'];
  final List<String> _intensities = ['Low', 'Medium', 'High'];
  final List<String> _tempos = ['Slow', 'Medium', 'Fast'];
  final List<String> _purposes = ['Study', 'Meditation', 'Workout', 'Sleep', 'Gaming', 'Cinematic', 'Background'];

  final List<Map<String, String>> _presets = [
    {'title': 'Study Piano', 'prompt': 'Calm peaceful piano music for studying', 'mood': 'Calm', 'genre': 'Ambient', 'instrument': 'Piano', 'tempo': 'Slow', 'purpose': 'Study'},
    {'title': 'Meditation', 'prompt': 'Deep ambient flute and pad music for meditation', 'mood': 'Peaceful', 'genre': 'Ambient', 'instrument': 'Flute', 'tempo': 'Slow', 'purpose': 'Meditation'},
    {'title': 'Workout Beats', 'prompt': 'Energetic upbeat electronic music for workout', 'mood': 'Energetic', 'genre': 'Electronic', 'instrument': 'Drums', 'tempo': 'Fast', 'purpose': 'Workout'},
    {'title': 'Cinematic Strings', 'prompt': 'Emotional dark orchestral strings composition', 'mood': 'Dark', 'genre': 'Cinematic', 'instrument': 'Strings', 'tempo': 'Medium', 'purpose': 'Cinematic'},
    {'title': 'Lo-Fi Chill', 'prompt': 'Relaxing lo-fi acoustic guitar beat', 'mood': 'Relaxing', 'genre': 'Lo-fi', 'instrument': 'Guitar', 'tempo': 'Slow', 'purpose': 'Background'},
  ];

  @override
  void initState() {
    super.initState();
    _checkBackendStatus();
  }

  Future<void> _checkBackendStatus() async {
    final status = await _apiService.checkHealth();
    if (mounted) {
      setState(() => _isBackendConnected = status);
    }
  }

  void _applyPreset(Map<String, String> preset) {
    setState(() {
      _promptController.text = preset['prompt'] ?? '';
      _selectedMood = preset['mood'];
      _selectedGenre = preset['genre'];
      _selectedInstrument = preset['instrument'];
      _selectedTempo = preset['tempo'];
      _selectedPurpose = preset['purpose'];
    });
  }

  void _onGeneratePressed() {
    final prompt = _promptController.text.trim();
    if (prompt.isEmpty && _selectedMood == null && _selectedGenre == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a music prompt or select musical preferences.')),
      );
      return;
    }

    final request = MusicRequest(
      prompt: prompt,
      mood: _selectedMood,
      genre: _selectedGenre,
      instrument: _selectedInstrument,
      intensity: _selectedIntensity,
      tempo: _selectedTempo,
      purpose: _selectedPurpose,
      duration: _durationSeconds,
    );

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => GeneratingScreen(request: request),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.music_note, color: AppTheme.secondary),
            const SizedBox(width: 8),
            const Text('MuseAI Composer', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history_rounded),
            tooltip: 'Composition History',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const HistoryScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Backend Status Banner
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'AI Music Generator',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _isBackendConnected
                        ? Colors.green.withOpacity(0.2)
                        : Colors.red.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _isBackendConnected ? Colors.green : Colors.red,
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 4,
                        backgroundColor: _isBackendConnected ? Colors.green : Colors.red,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _isBackendConnected ? 'Backend Connected' : 'Backend Offline',
                        style: TextStyle(
                          fontSize: 11,
                          color: _isBackendConnected ? Colors.green : Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Compose original music using Meta MusicGen-small & Apple M1 GPU',
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),

            const SizedBox(height: 20),

            // Prompt Text Input Field
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Describe your music',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _promptController,
                    maxLines: 3,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      hintText: 'e.g. Calm peaceful piano music for studying...',
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Quick Presets
            const Text(
              'Quick Presets',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _presets.map((preset) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ActionChip(
                      backgroundColor: AppTheme.surface,
                      side: const BorderSide(color: AppTheme.border),
                      label: Text(preset['title']!),
                      labelStyle: const TextStyle(color: AppTheme.secondary, fontSize: 12),
                      onPressed: () => _applyPreset(preset),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 16),

            // Expandable Musical Controls
            GlassCard(
              child: Column(
                children: [
                  InkWell(
                    onTap: () {
                      setState(() => _showAdvancedControls = !_showAdvancedControls);
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.tune_rounded, color: AppTheme.primary, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Musical Preferences & Controls',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ],
                        ),
                        Icon(
                          _showAdvancedControls
                              ? Icons.keyboard_arrow_up_rounded
                              : Icons.keyboard_arrow_down_rounded,
                          color: AppTheme.textSecondary,
                        ),
                      ],
                    ),
                  ),

                  if (_showAdvancedControls) ...[
                    const SizedBox(height: 16),
                    const Divider(color: AppTheme.border),
                    const SizedBox(height: 12),

                    // Grid of Dropdowns
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        _buildDropdown('Mood', _selectedMood, _moods, (val) => setState(() => _selectedMood = val)),
                        _buildDropdown('Genre', _selectedGenre, _genres, (val) => setState(() => _selectedGenre = val)),
                        _buildDropdown('Instrument', _selectedInstrument, _instruments, (val) => setState(() => _selectedInstrument = val)),
                        _buildDropdown('Intensity', _selectedIntensity, _intensities, (val) => setState(() => _selectedIntensity = val)),
                        _buildDropdown('Tempo', _selectedTempo, _tempos, (val) => setState(() => _selectedTempo = val)),
                        _buildDropdown('Purpose', _selectedPurpose, _purposes, (val) => setState(() => _selectedPurpose = val)),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Duration Slider Card
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Composition Duration',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      Text(
                        '${_durationSeconds}s',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.secondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppTheme.primary,
                      inactiveTrackColor: AppTheme.border,
                      thumbColor: AppTheme.secondary,
                    ),
                    child: Slider(
                      value: _durationSeconds.toDouble(),
                      min: 1,
                      max: 15,
                      divisions: 14,
                      label: '$_durationSeconds seconds',
                      onChanged: (val) {
                        setState(() => _durationSeconds = val.toInt());
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Generate Button
            ElevatedButton(
              onPressed: _onGeneratePressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 6,
                shadowColor: AppTheme.primary.withOpacity(0.5),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.auto_awesome, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'Generate Music Composition',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown(
    String title,
    String? selectedValue,
    List<String> items,
    ValueChanged<String?> onChanged,
  ) {
    return SizedBox(
      width: 145,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          const SizedBox(height: 4),
          DropdownButtonFormField<String>(
            initialValue: selectedValue,
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              isDense: true,
              fillColor: AppTheme.surface,
            ),
            dropdownColor: AppTheme.surface,
            hint: Text('Select $title', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
            items: items.map((item) {
              return DropdownMenuItem(
                value: item,
                child: Text(item, style: const TextStyle(fontSize: 12, color: Colors.white)),
              );
            }).toList(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
