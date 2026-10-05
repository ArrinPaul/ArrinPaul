// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { cheatSheets } from './data';

afterEach(cleanup);

describe('App', () => {
  it('renders every cheat sheet and the result count', () => {
    render(<App />);
    expect(screen.getAllByRole('article').filter((el) => el.className === 'card')).toHaveLength(
      cheatSheets.length,
    );
    expect(screen.getByRole('status').textContent).toBe(`${cheatSheets.length} cheat sheets`);
  });

  it('filters by search text and updates the count', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Search the atlas'), 'docker');
    expect(screen.getByRole('heading', { name: 'Docker dev container' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Typed fetch helper' })).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('1 cheat sheet');
  });

  it('filters by category chip and marks it pressed', async () => {
    const user = userEvent.setup();
    render(<App />);
    const chip = screen.getByRole('button', { name: 'Git' });
    await user.click(chip);
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Review before you commit' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Docker dev container' })).toBeNull();
  });

  it('shows an empty state and recovers with Clear filters', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText('Search the atlas'), 'zzzz-no-match');
    expect(screen.getByText('No cheat sheets match that search')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.queryByText('No cheat sheets match that search')).toBeNull();
    expect(screen.getByRole('status').textContent).toBe(`${cheatSheets.length} cheat sheets`);
  });
});

describe('copy button', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('copies the snippet and shows Copied', async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs its own clipboard stub, so replace it afterwards.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Copy the Docker dev container snippet' }));

    const docker = cheatSheets.find((item) => item.title === 'Docker dev container')!;
    expect(writeText).toHaveBeenCalledWith(docker.snippet);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Copy the Docker dev container snippet' }).textContent,
      ).toBe('Copied'),
    );
  });

  it('reports a failure instead of throwing when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    });
    // jsdom has no execCommand, so the fallback path fails too.
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Copy the Typed fetch helper snippet' }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Copy the Typed fetch helper snippet' }).textContent,
      ).toBe('Copy failed'),
    );
  });
});
