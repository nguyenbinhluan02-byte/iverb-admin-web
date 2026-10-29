import type { Question } from '@/services/questions'

export function makeQuestion(over: Partial<Question> & { id: number }): Question {
  return {
    type: 'single',
    prompt: `Question ${over.id}`,
    content: {
      options: [
        { id: 'a', text: 'went' },
        { id: 'b', text: 'gone' },
      ],
    },
    answer_key: { correct: ['a'] },
    explanation: null,
    status: 'published',
    date: '2026-10-01',
    author: { id: 'u', name: 'Linh Tran', role: 'admin' },
    author_name: null,
    has_answers: false,
    usage_count: 1,
    created_at: '',
    updated_at: '',
    ...over,
  }
}
