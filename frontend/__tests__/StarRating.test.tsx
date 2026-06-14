import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../src/components/StarRating';

describe('StarRating', () => {
  it('should render 5 star buttons', () => {
    render(<StarRating rating={0} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('should fill stars up to the given rating', () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByRole('button');
    stars.forEach((star, i) => {
      if (i < 3) {
        expect(star.querySelector('svg')).toHaveClass('text-accent-primary');
      } else {
        expect(star.querySelector('svg')).toHaveClass('text-secondary');
      }
    });
  });

  it('should call onRate when clicked in interactive mode', () => {
    const onRate = vi.fn();
    render(<StarRating rating={0} interactive onRate={onRate} />);
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]); // click 3rd star
    expect(onRate).toHaveBeenCalledWith(3);
  });

  it('should not call onRate when clicked in non-interactive mode', () => {
    const onRate = vi.fn();
    render(<StarRating rating={0} interactive={false} onRate={onRate} />);
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]);
    expect(onRate).not.toHaveBeenCalled();
  });

  it('should show hover effect on interactive stars', () => {
    render(<StarRating rating={0} interactive onRate={vi.fn()} />);
    const stars = screen.getAllByRole('button');
    fireEvent.mouseEnter(stars[1]); // hover 2nd star
    // All stars up to 2 should now show as filled
    expect(stars[0].querySelector('svg')).toHaveClass('text-accent-primary');
    expect(stars[1].querySelector('svg')).toHaveClass('text-accent-primary');
    expect(stars[2].querySelector('svg')).toHaveClass('text-secondary');
  });

  it('should reset hover on mouse leave', () => {
    render(<StarRating rating={1} interactive onRate={vi.fn()} />);
    const stars = screen.getAllByRole('button');
    fireEvent.mouseEnter(stars[3]); // hover 4th star
    fireEvent.mouseLeave(stars[3]); // leave
    // Should revert to original rating of 1
    expect(stars[0].querySelector('svg')).toHaveClass('text-accent-primary');
    expect(stars[1].querySelector('svg')).toHaveClass('text-secondary');
  });

  it('should show value when showValue is true', () => {
    render(<StarRating rating={4.2} showValue />);
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('should show dash when rating is 0 and showValue is true', () => {
    render(<StarRating rating={0} showValue />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<StarRating rating={0} size="sm" />);
    const stars = screen.getAllByRole('button');
    expect(stars[0].className).toContain('w-4 h-4');

    rerender(<StarRating rating={0} size="lg" />);
    const lgStars = screen.getAllByRole('button');
    expect(lgStars[0].className).toContain('w-6 h-6');
  });
});
