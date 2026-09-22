import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

class AudioPlayerService extends ChangeNotifier {
  final AudioPlayer _audioPlayer = AudioPlayer();
  PlayerState _playerState = PlayerState.stopped;
  Duration _position = Duration.zero;
  Duration _duration = Duration.zero;
  String? _currentUrl;

  PlayerState get playerState => _playerState;
  Duration get position => _position;
  Duration get duration => _duration;
  bool get isPlaying => _playerState == PlayerState.playing;
  String? get currentUrl => _currentUrl;

  AudioPlayerService() {
    _initStreams();
  }

  void _initStreams() {
    _audioPlayer.onPlayerStateChanged.listen((state) {
      _playerState = state;
      notifyListeners();
    });

    _audioPlayer.onPositionChanged.listen((pos) {
      _position = pos;
      notifyListeners();
    });

    _audioPlayer.onDurationChanged.listen((dur) {
      _duration = dur;
      notifyListeners();
    });

    _audioPlayer.onPlayerComplete.listen((_) {
      _playerState = PlayerState.completed;
      _position = Duration.zero;
      notifyListeners();
    });
  }

  Future<void> play(String url) async {
    try {
      if (_currentUrl != url) {
        _currentUrl = url;
        await _audioPlayer.stop();
        await _audioPlayer.play(UrlSource(url));
      } else {
        if (_playerState == PlayerState.paused) {
          await _audioPlayer.resume();
        } else {
          await _audioPlayer.play(UrlSource(url));
        }
      }
    } catch (e) {
      debugPrint('Error playing audio: $e');
    }
  }

  Future<void> pause() async {
    await _audioPlayer.pause();
  }

  Future<void> resume() async {
    await _audioPlayer.resume();
  }

  Future<void> stop() async {
    await _audioPlayer.stop();
    _position = Duration.zero;
    notifyListeners();
  }

  Future<void> seek(Duration position) async {
    await _audioPlayer.seek(position);
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }
}
