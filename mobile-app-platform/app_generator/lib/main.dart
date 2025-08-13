import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const AppGeneratorApp());
}

class AppGeneratorApp extends StatelessWidget {
  const AppGeneratorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI App Generator',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const AppGeneratorHome(),
    );
  }
}

class AppGeneratorHome extends StatefulWidget {
  const AppGeneratorHome({super.key});

  @override
  State<AppGeneratorHome> createState() => _AppGeneratorHomeState();
}

class _AppGeneratorHomeState extends State<AppGeneratorHome> {
  final TextEditingController _appIdeaController = TextEditingController();
  final TextEditingController _targetAudienceController = TextEditingController();
  String _selectedCategory = 'Productivity';
  String _selectedMonetization = 'Ads';
  bool _isGenerating = false;
  String _generatedContent = '';

  final List<String> _categories = [
    'Productivity',
    'Entertainment', 
    'Education',
    'Health & Fitness',
    'Social',
    'Games',
    'Business',
    'Lifestyle'
  ];

  final List<String> _monetizationOptions = [
    'Ads',
    'In-App Purchase',
    'Subscription',
    'Freemium',
    'One-Time Purchase'
  ];

  Future<void> _generateApp() async {
    if (_appIdeaController.text.trim().isEmpty) return;

    setState(() {
      _isGenerating = true;
      _generatedContent = '';
    });

    try {
      // Call shared services API
      final response = await http.post(
        Uri.parse('http://localhost:3000/api/ai/generate-content'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'platform': 'mobile-app',
          'type': 'app-concept',
          'prompt': '''
Generate a comprehensive mobile app concept based on:
- App Idea: ${_appIdeaController.text}
- Target Audience: ${_targetAudienceController.text}
- Category: $_selectedCategory
- Monetization: $_selectedMonetization

Include:
1. App name suggestions (3 options)
2. Feature list (core and advanced)
3. UI/UX design recommendations
4. Technical implementation approach
5. Marketing strategy
6. Revenue projections
7. Development timeline
8. Required APIs and integrations
''',
          'parameters': {
            'maxTokens': 1500,
            'temperature': 0.8
          }
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _generatedContent = data['content'];
        });
      } else {
        throw Exception('Failed to generate app concept');
      }
    } catch (error) {
      setState(() {
        _generatedContent = 'Error generating app concept: $error';
      });
    } finally {
      setState(() {
        _isGenerating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🚀 AI App Generator'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'App Concept Generator',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _appIdeaController,
                      decoration: const InputDecoration(
                        labelText: 'App Idea',
                        hintText: 'Describe your app idea in detail...',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _targetAudienceController,
                      decoration: const InputDecoration(
                        labelText: 'Target Audience',
                        hintText: 'Who is your target audience?',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _selectedCategory,
                            decoration: const InputDecoration(
                              labelText: 'Category',
                              border: OutlineInputBorder(),
                            ),
                            items: _categories.map((category) {
                              return DropdownMenuItem(
                                value: category,
                                child: Text(category),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedCategory = value!;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            value: _selectedMonetization,
                            decoration: const InputDecoration(
                              labelText: 'Monetization',
                              border: OutlineInputBorder(),
                            ),
                            items: _monetizationOptions.map((option) {
                              return DropdownMenuItem(
                                value: option,
                                child: Text(option),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                _selectedMonetization = value!;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isGenerating ? null : _generateApp,
                        child: _isGenerating
                            ? const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Text('Generating...'),
                                ],
                              )
                            : const Text('🤖 Generate App Concept'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (_generatedContent.isNotEmpty) ...[
              const Text(
                'Generated App Concept:',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: SingleChildScrollView(
                      child: SelectableText(
                        _generatedContent,
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _appIdeaController.dispose();
    _targetAudienceController.dispose();
    super.dispose();
  }
}