let availableMods = [];
let selectedMods = [];

// Load mods from JSON
async function loadMods() {
    try {
        const response = await fetch('mods.json');
        availableMods = await response.json();
        
        // Categorize mods
        const categorizedMods = {
            dinos: availableMods.filter(mod => mod.category === 'dino'),
            maps: availableMods.filter(mod => mod.category === 'map'),
            skins: availableMods.filter(mod => mod.category === 'skin'),
            misc: availableMods.filter(mod => mod.category === 'misc')
        };

        // Render mods for each category
        Object.entries(categorizedMods).forEach(([category, mods]) => {
            const grid = document.querySelector(`#${category} .mod-grid`);
            mods.forEach(mod => {
                const modElement = createModElement(mod);
                grid.appendChild(modElement);
            });
        });

        updateUI();
    } catch (error) {
        console.error('Error loading mods:', error);
        document.querySelectorAll('.mod-grid').forEach(grid => {
            grid.innerHTML = 'Error loading mods. Please try again.';
        });
    }
}

// Create mod element
function createModElement(mod) {
    const div = document.createElement('div');
    div.className = 'mod-item';
    div.innerHTML = `
        <input type="checkbox" data-id="${mod.id}">
        <div class="mod-info">
            <h3 class="mod-name">${mod.name}</h3>
            <p class="mod-id">${mod.id}</p>
        </div>
    `;

    const checkbox = div.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            selectedMods.push(mod);
        } else {
            selectedMods = selectedMods.filter(m => m.id !== mod.id);
        }
        updateUI();
    });

    return div;
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const activeTab = document.querySelector('.tab-content.active');
    const activeCategory = activeTab.id;
    
    // Get all current mod elements and their checked states
    const currentSelections = {};
    activeTab.querySelectorAll('.mod-item input[type="checkbox"]').forEach(checkbox => {
        currentSelections[checkbox.dataset.modId] = checkbox.checked;
    });

    const categoryMods = availableMods.filter(mod => mod.category === activeCategory);
    const filteredMods = categoryMods.filter(mod => 
        mod.name.toLowerCase().includes(searchTerm) ||
        mod.id.toLowerCase().includes(searchTerm)
    );

    const grid = activeTab.querySelector('.mod-grid');
    grid.innerHTML = '';
    filteredMods.forEach(mod => {
        const modElement = createModElement(mod);
        // Restore checked state
        const checkbox = modElement.querySelector('input[type="checkbox"]');
        if (currentSelections[mod.id]) {
            checkbox.checked = true;
        }
        grid.appendChild(modElement);
    });

    // If search is cleared, show all mods for the category
    if (searchTerm === '') {
        categoryMods.forEach(mod => {
            const modElement = createModElement(mod);
            // Restore checked state
            const checkbox = modElement.querySelector('input[type="checkbox"]');
            if (currentSelections[mod.id]) {
                checkbox.checked = true;
            }
            grid.appendChild(modElement);
        });
    }
}

// Add this to clear search when switching tabs
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = ''; // Clear search input
        // Trigger search event to reset the view
        searchInput.dispatchEvent(new Event('input'));
    });
});

// Select all function
function selectAll(category) {
    const activeTab = document.getElementById(category);
    const checkboxes = activeTab.querySelectorAll('input[type="checkbox"]');
    
    // Check if all checkboxes are already selected
    const allSelected = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    // Toggle all checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.checked = !allSelected;
        // Trigger change event to update the selected mods list
        const event = new Event('change');
        checkbox.dispatchEvent(event);
    });

    // Update UI
    updateUI();
}

// Update UI
function updateUI() {
    const generateButton = document.getElementById('generateButton');
    const selectedCount = document.getElementById('selectedCount');
    const selectedModsList = document.getElementById('selectedModsList');

    generateButton.disabled = selectedMods.length === 0;
    selectedCount.textContent = selectedMods.length;
    
    selectedModsList.innerHTML = selectedMods
        .map(mod => `<li>${mod.name} (${mod.id})</li>`)
        .join('');
}

// Generate mod list
function generateModList() {
    if (selectedMods.length === 0) return;

    // Create a list of EnabledMods entries, one per line
    const modLines = selectedMods.map(mod => `EnabledMods=${mod.id}`).join('\n');
    
    const content = `[PathOfTitans.Mods]\n${modLines}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GameUserSettings.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        parseSettingsFile(e.target.result);
    };
    reader.readAsText(file);
}

// Parse settings file
function parseSettingsFile(contents) {
    try {
        console.log('File contents:', contents);

        // Split file into lines
        const lines = contents.split('\n');
        
        // Find all EnabledMods entries
        const modIds = lines
            .filter(line => line.trim().startsWith('EnabledMods='))
            .map(line => line.split('=')[1].trim());

        console.log('Found mod IDs:', modIds);

        if (modIds.length === 0) {
            console.log('No EnabledMods entries found');
            alert('No mods found in the settings file. Please make sure you selected the correct GameUserSettings.ini');
            return;
        }

        // Uncheck all mods first
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear selected mods array
        selectedMods = [];

        // Check matching mods
        let matchedCount = 0;
        modIds.forEach(modId => {
            console.log('Looking for mod:', modId);
            
            const checkbox = document.querySelector(`input[data-id="${modId}"]`);
            if (checkbox) {
                checkbox.checked = true;
                matchedCount++;
                // Add to selected mods array
                const mod = availableMods.find(m => m.id === modId);
                if (mod) selectedMods.push(mod);
            } else {
                console.log('No checkbox found for mod:', modId);
            }
        });

        // Update UI
        updateUI();

        // Show results
        alert(`Imported ${matchedCount} mods from your settings file.\n${modIds.length - matchedCount} mods were not found in the current mod list.`);

    } catch (error) {
        console.error('Error parsing settings file:', error);
        alert('Error reading settings file. Please check the console for details.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadMods();
    
    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('generateButton').addEventListener('click', generateModList);
    document.getElementById('settingsFile').addEventListener('change', handleFileImport);

    // Tab functionality
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            tab.classList.add('active');
            const tabContent = document.getElementById(tab.dataset.tab);
            tabContent.classList.add('active');
        });
    });
});