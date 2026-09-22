import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class WaveformPainter extends CustomPainter {
  final List<double> points;
  final double progress; // 0.0 to 1.0 playback progress

  WaveformPainter({
    required this.points,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    final paintUnplayed = Paint()
      ..color = AppTheme.primary.withOpacity(0.6)
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.0;

    final paintPlayed = Paint()
      ..color = AppTheme.secondary
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 3.0;

    final width = size.width;
    final height = size.height;
    final barSpacing = width / points.length;
    final middleY = height / 2;

    final playedIndex = (points.length * progress).clamp(0, points.length).toInt();

    for (int i = 0; i < points.length; i++) {
      final x = i * barSpacing + (barSpacing / 2);
      final amplitude = (points[i].clamp(0.05, 1.0)) * (height * 0.45);
      final top = middleY - amplitude;
      final bottom = middleY + amplitude;

      final currentPaint = (i <= playedIndex) ? paintPlayed : paintUnplayed;
      canvas.drawLine(Offset(x, top), Offset(x, bottom), currentPaint);
    }
  }

  @override
  bool shouldRepaint(covariant WaveformPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.points != points;
  }
}
