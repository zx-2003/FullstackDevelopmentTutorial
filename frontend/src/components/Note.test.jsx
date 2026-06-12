import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Note from './Note'

// describe groups related tests together, making it easier to read and maintain
describe('Note', () => {
  const baseNote = {
    id: 1,
    title: 'Test Note',
    content: 'This is the note content',
    created_at: '2024-01-15T10:00:00Z',
    images: null,
  }

  // Each it block is an individual test case (it is basically test)
  it('renders the title and content', () => {
    // render the Note component with the baseNote data and a dummy onDelete function
    render(<Note note={baseNote} onDelete={() => {}} />)

    // Use screen.getByText to find elements by their text content and assert that they are in the document
    // getByText will throw an error if the text is not found, causing the test to fail
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByText('This is the note content')).toBeInTheDocument()
  })

  it('renders a formatted date', () => {
    render(<Note note={baseNote} onDelete={() => {}} />)

    const expected = new Date(baseNote.created_at).toLocaleDateString('en-US')
    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it('does not render an image when note.images is not set', () => {
    render(<Note note={baseNote} onDelete={() => {}} />)

    expect(screen.queryByAltText('Note Image')).not.toBeInTheDocument()
  })

  it('renders an image when note.images is set', () => {
    const noteWithImage = { ...baseNote, images: 'https://example.com/image.png' }

    render(<Note note={noteWithImage} onDelete={() => {}} />)

    // getByAltText is used to find the image element by its alt text, and we assert that it is in the document and has the correct src attribute
    const image = screen.getByAltText('Note Image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.png')
  })

  it('calls onDelete with the note id when the delete button is clicked', () => {
    // vi.fn() is used to create a mock function that we can use to track calls and arguments, allowing us to assert that the onDelete function is called correctly when the delete button is clicked
    const handleDelete = vi.fn()

    render(<Note note={baseNote} onDelete={handleDelete} />)
    // fireEvent.click is used to simulate a click event on the delete button, which should trigger the onDelete function with the note's id
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(handleDelete).toHaveBeenCalledTimes(1)
    expect(handleDelete).toHaveBeenCalledWith(baseNote.id)
  })
})
