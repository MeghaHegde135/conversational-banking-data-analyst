import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { KpiCard } from '../components/KpiCard';
import { DataTable } from '../components/DataTable';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import { QuestionInput } from '../components/QuestionInput';
import { ChatMessage } from '../components/ChatMessage';
import { ErrorMessage } from '../components/ErrorMessage';
import { ChatMessageItem } from '../types';

describe('Frontend Banking Analytics UI Components & Interactions', () => {
  it('renders Header with branding and live status', () => {
    render(<App />);
    expect(screen.getByText('Conversational Banking Data Analyst')).toBeInTheDocument();
    expect(
      screen.getByText('Enterprise Financial Intelligence • Strictly Parameterized SQL Engine')
    ).toBeInTheDocument();
  });

  it('renders suggested questions tray with 6 supported inquiries', () => {
    const handleSelect = vi.fn();
    render(<SuggestedQuestions onSelectQuestion={handleSelect} isLoading={false} />);

    expect(screen.getByText('Customer Count')).toBeInTheDocument();
    expect(screen.getByText('Pending Files')).toBeInTheDocument();
    expect(screen.getByText('Application Status')).toBeInTheDocument();
    expect(screen.getByText('Top Branches')).toBeInTheDocument();
    expect(screen.getByText('Total Volume')).toBeInTheDocument();
    expect(screen.getByText('Monthly Trends')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Customer Count'));
    expect(handleSelect).toHaveBeenCalledWith('How many customers do we have?');
  });

  it('renders QuestionInput and enforces validation on empty submission', () => {
    const handleSubmit = vi.fn();
    render(<QuestionInput onSubmit={handleSubmit} isLoading={false} />);

    const sendBtn = screen.getByRole('button', { name: /Ask Analyst/i });
    expect(sendBtn).toBeDisabled();

    const input = screen.getByPlaceholderText(/Ask a banking analytics inquiry/i);
    fireEvent.change(input, { target: { value: 'How many customers do we have?' } });
    expect(sendBtn).not.toBeDisabled();

    fireEvent.click(sendBtn);
    expect(handleSubmit).toHaveBeenCalledWith('How many customers do we have?');
  });

  it('renders KpiCard with formatted customer count', () => {
    const mockData = [{ total_customers: 20 }];
    render(<KpiCard intent="customer_count" data={mockData} />);

    expect(screen.getByText('Total Registered Customers')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders KpiCard with formatted total transactions volume', () => {
    const mockData = [
      {
        total_count: 38,
        total_amount: 228232.0,
        average_amount: 6006.11,
        min_amount: 310.0,
        max_amount: 24500.0,
      },
    ];
    render(<KpiCard intent="total_transactions" data={mockData} />);

    expect(screen.getByText('Total Transaction Volume')).toBeInTheDocument();
    expect(screen.getByText('$228,232.00')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('$6,006.11')).toBeInTheDocument();
  });

  it('renders DataTable with formatted headers and status badges', () => {
    const mockTableData = [
      {
        id: 19,
        customer_name: 'Summit Supply Chain',
        branch_name: 'Capitol Valley Branch',
        status: 'PENDING',
        application_date: '2025-10-15',
      },
    ];

    render(<DataTable data={mockTableData} title="Pending Applications" />);

    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
    expect(screen.getByText('Summit Supply Chain')).toBeInTheDocument();
    expect(screen.getByText('Capitol Valley Branch')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders AnalyticsChart with monthly trend toggle', () => {
    const mockMonthly = [
      { month: '2025-01', total_amount: 2430.5, transaction_count: 2 },
      { month: '2025-02', total_amount: 17640.25, transaction_count: 3 },
    ];

    render(
      <AnalyticsChart intent="monthly_transactions" defaultVisualization="bar" data={mockMonthly} />
    );

    expect(screen.getByText('Monthly Transaction Activity Trends')).toBeInTheDocument();
    expect(screen.getByText('Bar View')).toBeInTheDocument();
    expect(screen.getByText('Line Trend')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Line Trend'));
    expect(screen.getByText('Line Trend')).toHaveClass('active');
  });

  it('supports Copy Answer and Copy Data actions on ChatMessage', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const mockMessage: ChatMessageItem = {
      id: 'assistant-1',
      sender: 'assistant',
      timestamp: '12:00 PM',
      content: 'We currently have 20 registered customers across all active regional branches.',
      response: {
        success: true,
        question: 'How many customers do we have?',
        intent: 'customer_count',
        dataset: 'customers',
        answer: 'We currently have 20 registered customers across all active regional branches.',
        visualization: 'kpi',
        data: [{ total_customers: 20 }],
      },
    };

    render(<ChatMessage message={mockMessage} onSelectSuggestedQuestion={vi.fn()} />);

    // Test Copy Answer wrapped in act
    await act(async () => {
      const copyAnswerBtn = screen.getByText(/Copy Answer/i);
      fireEvent.click(copyAnswerBtn);
    });
    expect(writeTextMock).toHaveBeenCalledWith(mockMessage.content);

    // Test Copy Data wrapped in act
    await act(async () => {
      const copyDataBtn = screen.getByText(/Copy Raw Data/i);
      fireEvent.click(copyDataBtn);
    });
    expect(writeTextMock).toHaveBeenCalledWith(JSON.stringify(mockMessage.response?.data, null, 2));
  });

  it('renders ErrorMessage with recovery suggestions for unsupported questions', () => {
    const handleSelect = vi.fn();
    const supported = [
      { intent: 'customer_count', example: 'How many customers do we have?' },
      { intent: 'total_transactions', example: 'What is the total transaction amount?' },
    ];

    render(
      <ErrorMessage
        error="Unsupported question. Could not map inquiry."
        supportedIntents={supported}
        onSelectIntent={handleSelect}
      />
    );

    expect(screen.getByText('Unsupported question. Could not map inquiry.')).toBeInTheDocument();
    expect(screen.getByText('“How many customers do we have?”')).toBeInTheDocument();

    fireEvent.click(screen.getByText('“How many customers do we have?”'));
    expect(handleSelect).toHaveBeenCalledWith('How many customers do we have?');
  });
});
