import 'dart:convert';
import 'package:http/http.dart' as http;

class HamsafarApi {
  HamsafarApi({this.baseUrl = 'http://127.0.0.1:8080'});
  final String baseUrl;
  String? token;

  Future<Map<String, dynamic>> _json(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool auth = false,
  }) async {
    final headers = <String, String>{'content-type': 'application/json'};
    if (auth && token != null) headers['authorization'] = 'Bearer $token';
    final uri = Uri.parse('$baseUrl$path');
    final res = method == 'GET'
        ? await http.get(uri, headers: headers)
        : await http.post(uri, headers: headers, body: jsonEncode(body ?? {}));
    final data = jsonDecode(res.body);
    if (res.statusCode >= 400) {
      throw Exception(data['error'] ?? 'REQUEST_FAILED');
    }
    return data is Map<String, dynamic> ? data : {'data': data};
  }

  Future<Map<String, dynamic>> health() => _json('GET', '/health');

  Future<Map<String, dynamic>> checkUpdate({String current = '0.1.0'}) {
    return _json('GET', '/update/check?platform=android&current=$current');
  }

  Future<void> register(String email, String password) async {
    await _json('POST', '/auth/register', body: {'email': email, 'password': password});
  }

  Future<void> login(String email, String password) async {
    final data = await _json('POST', '/auth/login', body: {'email': email, 'password': password});
    token = data['token'] as String?;
  }

  Future<Map<String, dynamic>> createTrip(String title) {
    return _json('POST', '/trips', auth: true, body: {
      'title': title,
      'stops': [
        {'name': 'تهران', 'lat': 35.7, 'lng': 51.4},
        {'name': 'اصفهان', 'lat': 32.6, 'lng': 51.7},
      ],
    });
  }

  Future<List<dynamic>> destinations(String q) async {
    final res = await http.get(Uri.parse('$baseUrl/destinations?q=${Uri.encodeQueryComponent(q)}'));
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<void> addContact() async {
    await _json('POST', '/emergency/contacts', auth: true, body: {
      'id': 'home',
      'name': 'خانه',
      'phone': '110',
    });
  }

  Future<Map<String, dynamic>> sos() {
    return _json('POST', '/emergency/sos', auth: true, body: {
      'coords': {'lat': 35.7, 'lng': 51.4},
      'offline': true,
    });
  }
}
