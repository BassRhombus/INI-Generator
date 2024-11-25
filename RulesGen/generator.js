const markdownTags = [
    { label: "Title", value: "title", className: "title" },
    { label: "Large", value: "large", className: "large" },
    { label: "Small", value: "small", className: "small" },
    { label: "Red", value: "red", className: "red" },
    { label: "Orange", value: "orange", className: "orange" },
    { label: "Yellow", value: "yellow", className: "yellow" },
    { label: "Green", value: "green", className: "green" },
    { label: "Blue", value: "blue", className: "blue" },
    { label: "Purple", value: "purple", className: "purple" },
    { label: "White", value: "white", className: "white" }
];

let lines = [];

// Initialize the tag buttons
function initializeTagButtons() {
    const tagButtons = document.getElementById('tagButtons');
    markdownTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = `tag-button ${tag.className}`;
        button.textContent = tag.label;
        tagButtons.appendChild(button);
    });
}

// Structure for a segment
class Segment {
    constructor(type = 'white', content = '') {
        this.type = type;
        this.content = content;
    }
}

// Structure for a line
class Line {
    constructor() {
        this.segments = [new Segment()];
    }
}

// Add a new line
function addNewLine() {
    lines.push(new Line());
    renderLines();
}

// Add a segment to a line
function addSegment(lineIndex) {
    lines[lineIndex].segments.push(new Segment());
    renderLines();
}

// Remove a line
function removeLine(lineIndex) {
    lines.splice(lineIndex, 1);
    renderLines();
}

// Remove a segment
function removeSegment(lineIndex, segmentIndex) {
    if (lines[lineIndex].segments.length > 1) {
        lines[lineIndex].segments.splice(segmentIndex, 1);
        renderLines();
    }
}

// Update segment content
function updateSegmentContent(lineIndex, segmentIndex, content) {
    lines[lineIndex].segments[segmentIndex].content = content;
}

// Update segment type
function updateSegmentType(lineIndex, segmentIndex, type) {
    lines[lineIndex].segments[segmentIndex].type = type;
}

// Render all lines
function renderLines() {
    const container = document.getElementById('linesContainer');
    container.innerHTML = '';

    lines.forEach((line, lineIndex) => {
        const lineRow = document.createElement('div');
        lineRow.className = 'line-row';

        line.segments.forEach((segment, segmentIndex) => {
            const segmentContainer = document.createElement('div');
            segmentContainer.className = 'segment-container';

            // Type selector
            const typeSelect = document.createElement('select');
            markdownTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.value;
                option.textContent = tag.label;
                typeSelect.appendChild(option);
            });
            typeSelect.value = segment.type;
            typeSelect.onchange = (e) => updateSegmentType(lineIndex, segmentIndex, e.target.value);

            // Content input
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'element-input';
            input.value = segment.content;
            input.placeholder = 'Enter text...';
            input.onchange = (e) => updateSegmentContent(lineIndex, segmentIndex, e.target.value);

            // Remove segment button
            const removeSegmentBtn = document.createElement('button');
            removeSegmentBtn.className = 'remove-button';
            removeSegmentBtn.textContent = '×';
            removeSegmentBtn.onclick = () => removeSegment(lineIndex, segmentIndex);

            segmentContainer.appendChild(typeSelect);
            segmentContainer.appendChild(input);
            segmentContainer.appendChild(removeSegmentBtn);
            lineRow.appendChild(segmentContainer);
        });

        // Add segment button
        const addSegmentBtn = document.createElement('button');
        addSegmentBtn.className = 'add-segment-button';
        addSegmentBtn.textContent = '+ Add Segment';
        addSegmentBtn.onclick = () => addSegment(lineIndex);

        // Remove line button
        const removeLineBtn = document.createElement('button');
        removeLineBtn.className = 'remove-line-button';
        removeLineBtn.textContent = 'Remove Line';
        removeLineBtn.onclick = () => removeLine(lineIndex);

        lineRow.appendChild(addSegmentBtn);
        lineRow.appendChild(removeLineBtn);
        container.appendChild(lineRow);
    });
}

// Generate the output
function generateOutput() {
    const output = lines.map(line => {
        return line.segments
            .filter(segment => segment.content.trim() !== '')
            .map(segment => `<${segment.type}>${segment.content}</>`)
            .join('');
    }).filter(line => line !== '').join('\n');

    const outputContainer = document.getElementById('outputContainer');
    const outputElement = document.getElementById('output');
    
    outputContainer.style.display = 'block';
    outputElement.textContent = output;
}

// Download the output
function downloadOutput() {
    const output = lines.map(line => {
        return line.segments
            .filter(segment => segment.content.trim() !== '')
            .map(segment => `<${segment.type}>${segment.content}</>`)
            .join('');
    }).filter(line => line !== '').join('\n');

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules-motd.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize the application
window.onload = function() {
    initializeTagButtons();
    addNewLine(); // Start with one line
};
