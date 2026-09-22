import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/music_request.dart';
import '../models/music_result.dart';

class ApiService {
  static const String baseUrl = 'http://127.0.0.1:8000';

  static String getFullUrl(String path) {
    if (path.startsWith('http')) return path;
    return '$baseUrl$path';
  }

  Future<bool> checkHealth() async {
    try {
      final response = await http
          .get(Uri.parse('$baseUrl/health'))
          .timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['status'] == 'ok';
      }
    } catch (_) {}
    return false;
  }

  Future<MusicResult> generateMusic(MusicRequest request) async {
    final response = await http.post(
      Uri.parse('$baseUrl/generate'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(request.toJson()),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return MusicResult.fromJson(data);
    } else {
      final errData = json.decode(response.body);
      throw Exception(errData['detail'] ?? 'Music generation failed');
    }
  }

  Future<MusicResult> regenerateMusic(String generationId, {String? promptOverride}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/regenerate'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'generation_id': generationId,
        if (promptOverride != null) 'prompt_override': promptOverride,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return MusicResult.fromJson(data);
    } else {
      final errData = json.decode(response.body);
      throw Exception(errData['detail'] ?? 'Regeneration failed');
    }
  }

  Future<List<MusicResult>> fetchHistory() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/history'));
      if (response.statusCode == 200) {
        final List<dynamic> list = json.decode(response.body);
        return list.map((item) => MusicResult.fromJson(item)).toList();
      }
    } catch (_) {}
    return [];
  }
}
