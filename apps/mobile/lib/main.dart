import 'package:flutter/material.dart';

void main() {
  runApp(const HamsafarApp());
}

class HamsafarApp extends StatelessWidget {
  const HamsafarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'مولیدو همسفر',
      theme: ThemeData(colorSchemeSeed: Colors.green, useMaterial3: true),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('مولیدو همسفر')),
      body: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('نسخه محلی موبایل'),
            SizedBox(height: 8),
            Text('سفر • ناوبری • ایمنی • اضطراری • آفلاین'),
            SizedBox(height: 8),
            Text('API: http://127.0.0.1:8080'),
          ],
        ),
      ),
    );
  }
}
