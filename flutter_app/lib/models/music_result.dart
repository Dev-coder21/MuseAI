class MusicResult {
  final String generationId;
  final String originalPrompt;
  final String finalPrompt;
  final Map<String, dynamic> controls;
  final double durationSeconds;
  final int samplingRate;
  final String audioUrl;
  final String waveformUrl;
  final String spectrogramUrl;
  final List<double> waveformPoints;
  final double generationTimeSeconds;
  final String device;
  final String createdAt;

  MusicResult({
    required this.generationId,
    required this.originalPrompt,
    required this.finalPrompt,
    required this.controls,
    required this.durationSeconds,
    required this.samplingRate,
    required this.audioUrl,
    required this.waveformUrl,
    required this.spectrogramUrl,
    required this.waveformPoints,
    required this.generationTimeSeconds,
    required this.device,
    required this.createdAt,
  });

  factory MusicResult.fromJson(Map<String, dynamic> json) {
    return MusicResult(
      generationId: json['generation_id'] ?? '',
      originalPrompt: json['original_prompt'] ?? '',
      finalPrompt: json['final_prompt'] ?? '',
      controls: Map<String, dynamic>.from(json['controls'] ?? {}),
      durationSeconds: (json['duration_seconds'] as num?)?.toDouble() ?? 0.0,
      samplingRate: json['sampling_rate'] ?? 32000,
      audioUrl: json['audio_url'] ?? '',
      waveformUrl: json['waveform_url'] ?? '',
      spectrogramUrl: json['spectrogram_url'] ?? '',
      waveformPoints: (json['waveform_points'] as List<dynamic>?)
              ?.map((e) => (e as num).toDouble())
              .toList() ??
          [],
      generationTimeSeconds: (json['generation_time_seconds'] as num?)?.toDouble() ?? 0.0,
      device: json['device'] ?? 'mps',
      createdAt: json['created_at'] ?? '',
    );
  }
}
