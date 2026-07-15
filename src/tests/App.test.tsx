import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App', () => {
  it('renders the app with navigation', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Wordmemory')).toBeInTheDocument();
    expect(screen.getByText('学习')).toBeInTheDocument();
    expect(screen.getByText('词库')).toBeInTheDocument();
    expect(screen.getByText('统计')).toBeInTheDocument();
  });

  it('renders the learning page by default', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    expect(screen.getByText('AI背单词')).toBeInTheDocument();
    expect(screen.getByText('智能记忆算法，高效掌握英语词汇')).toBeInTheDocument();
  });
});
