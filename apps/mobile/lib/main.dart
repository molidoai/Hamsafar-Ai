import 'package:flutter/material.dart';
import 'api.dart';

void main() => runApp(const HamsafarApp());

class HamsafarApp extends StatelessWidget {
  const HamsafarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'مولیدو همسفر',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF16A34A), brightness: Brightness.dark),
        useMaterial3: true,
        fontFamily: 'Tahoma',
      ),
      home: const ShellPage(),
    );
  }
}

class ShellPage extends StatefulWidget {
  const ShellPage({super.key});
  @override
  State<ShellPage> createState() => _ShellPageState();
}

class _ShellPageState extends State<ShellPage> {
  final api = HamsafarApi();
  int index = 0;
  String status = 'وارد نشده';
  String output = 'API محلی: http://127.0.0.1:8080';
  final email = TextEditingController(text: 'demo@molido.shop');
  final password = TextEditingController(text: 'secret123');
  final query = TextEditingController(text: 'اصفهان');
  List places = [];

  Future<void> _run(Future<void> Function() job) async {
    try {
      await job();
    } catch (e) {
      setState(() => output = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final pages = [_home(), _destinations(), _sos()];
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(title: Text('مولیدو همسفر • $status')),
        body: pages[index],
        bottomNavigationBar: NavigationBar(
          selectedIndex: index,
          onDestinationSelected: (i) => setState(() => index = i),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home), label: 'خانه'),
            NavigationDestination(icon: Icon(Icons.place), label: 'مقصد'),
            NavigationDestination(icon: Icon(Icons.sos), label: 'اضطراری'),
          ],
        ),
      ),
    );
  }

  Widget _home() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(controller: email, decoration: const InputDecoration(labelText: 'ایمیل')),
        TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'رمز')),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: () => _run(() async {
            try {
              await api.register(email.text, password.text);
            } catch (_) {}
            await api.login(email.text, password.text);
            final trip = await api.createTrip('سفر آزمایشی');
            setState(() {
              status = 'وارد شده';
              output = 'سفر ساخته شد: ${trip['title']}';
            });
          }),
          child: const Text('ورود و ساخت سفر'),
        ),
        const SizedBox(height: 12),
        Text(output),
      ],
    );
  }

  Widget _destinations() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(controller: query, decoration: const InputDecoration(labelText: 'جستجوی مقصد')),
        FilledButton(
          onPressed: () => _run(() async {
            final rows = await api.destinations(query.text);
            setState(() {
              places = rows;
              output = '${rows.length} مقصد پیدا شد';
            });
          }),
          child: const Text('جستجو'),
        ),
        ...places.map((p) => ListTile(
              title: Text('${p['name']}'),
              subtitle: Text('${p['city']} • ${p['freshness']}'),
            )),
      ],
    );
  }

  Widget _sos() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Text('در شرایط اضطراری مخاطب مطمئن با رضایت شما خبر می‌شود.'),
          const SizedBox(height: 16),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => _run(() async {
              await api.addContact();
              final event = await api.sos();
              setState(() => output = 'SOS ثبت شد: ${event['event']?['id'] ?? event}');
            }),
            child: const Text('ارسال SOS آزمایشی'),
          ),
          const SizedBox(height: 16),
          Text(output),
        ],
      ),
    );
  }
}
