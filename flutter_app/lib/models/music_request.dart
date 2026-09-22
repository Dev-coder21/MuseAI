class MusicRequest {
  final String prompt;
  final String? mood;
  final String? genre;
  final String? instrument;
  final String? intensity;
  final String? tempo;
  final String? purpose;
  final int duration;

  MusicRequest({
    required this.prompt,
    this.mood,
    this.genre,
    this.instrument,
    this.intensity,
    this.tempo,
    this.purpose,
    this.duration = 5,
  });

  Map<String, dynamic> toJson() {
    return {
      'prompt': prompt,
      if (mood != null && mood!.isNotEmpty) 'mood': mood,
      if (genre != null && genre!.isNotEmpty) 'genre': genre,
      if (instrument != null && instrument!.isNotEmpty) 'instrument': instrument,
      if (intensity != null && intensity!.isNotEmpty) 'intensity': intensity,
      if (tempo != null && tempo!.isNotEmpty) 'tempo': tempo,
      if (purpose != null && purpose!.isNotEmpty) 'purpose': purpose,
      'duration': duration,
    };
  }
}
