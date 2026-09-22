import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_app/main.dart';

void main() {
  testWidgets('MuseAI App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MuseAIApp());
    expect(find.text('MuseAI Composer'), findsOneWidget);
  });
}
