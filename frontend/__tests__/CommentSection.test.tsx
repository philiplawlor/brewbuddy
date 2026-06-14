import { render, screen, fireEvent } from '@testing-library/react';
import { CommentSection } from '../src/components/CommentSection';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';

// Mock useAuth
vi.mock('../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../src/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

const mockComments = [
  {
    _id: 'comment-1',
    userId: { _id: 'user-1', username: 'brewer1' },
    text: 'Great recipe!',
    createdAt: '2026-06-10T00:00:00.000Z',
  },
  {
    _id: 'comment-2',
    userId: { _id: 'user-2', username: 'brewer2' },
    text: 'Tried it, loved it!',
    createdAt: '2026-06-11T00:00:00.000Z',
  },
];

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('CommentSection', () => {
  const mockOnAdd = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAdd.mockResolvedValue(undefined);
    mockOnDelete.mockResolvedValue(undefined);
  });

  it('should display empty state when no comments', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: null });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={[]} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  it('should render comments list', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: null });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={mockComments} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Great recipe!')).toBeInTheDocument();
    expect(screen.getByText('Tried it, loved it!')).toBeInTheDocument();
    expect(screen.getByText('brewer1')).toBeInTheDocument();
    expect(screen.getByText('brewer2')).toBeInTheDocument();
  });

  it('should show login prompt when user is not authenticated', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: null });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={[]} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    expect(screen.getByText(/log in/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/add a comment/i)).not.toBeInTheDocument();
  });

  it('should show comment form when user is authenticated', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={[]} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    expect(screen.getByPlaceholderText(/add a comment/i)).toBeInTheDocument();
    expect(screen.getByText('Post Comment')).toBeInTheDocument();
  });

  it('should call onAdd with comment text on submit', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={[]} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(textarea, { target: { value: 'New comment' } });
    fireEvent.click(screen.getByText('Post Comment'));

    expect(mockOnAdd).toHaveBeenCalledWith('New comment');
  });

  it('should clear form after successful submit', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={[]} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    const textarea = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(textarea, { target: { value: 'New comment' } });
    fireEvent.click(screen.getByText('Post Comment'));

    await vi.waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('should not submit empty comments', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={[]} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    fireEvent.click(screen.getByText('Post Comment'));
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('should show delete button for own comments', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    renderWithProviders(
      <CommentSection recipeId="r1" comments={mockComments} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    // user-1 owns comment-1
    const deleteButtons = screen.getAllByTitle('Delete comment');
    expect(deleteButtons).toHaveLength(1); // only own comment has delete
  });

  it('should call onDelete when delete is confirmed', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(
      <CommentSection recipeId="r1" comments={mockComments} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    fireEvent.click(screen.getByTitle('Delete comment'));

    expect(mockOnDelete).toHaveBeenCalledWith('comment-1');
  });

  it('should not call onDelete when cancel is clicked', async () => {
    const { useAuth } = await import('../src/context/AuthContext');
    (useAuth as any).mockReturnValue({ user: { _id: 'user-1', username: 'brewer1' } });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProviders(
      <CommentSection recipeId="r1" comments={mockComments} onAdd={mockOnAdd} onDelete={mockOnDelete} />
    );

    fireEvent.click(screen.getByTitle('Delete comment'));

    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
