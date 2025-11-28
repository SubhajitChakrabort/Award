// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top button functionality
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.remove('opacity-0', 'invisible');
            scrollToTopBtn.classList.add('opacity-100', 'visible');
        } else {
            scrollToTopBtn.classList.remove('opacity-100', 'visible');
            scrollToTopBtn.classList.add('opacity-0', 'invisible');
        }
    });

    // Smooth scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Search functionality
    const searchInput = document.getElementById('awardSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAwards(this.value.trim());
        });
    }
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
            mobileMenu.classList.add('hidden');
        }
    });

    // Close mobile menu when a menu item is clicked
    const mobileMenuItems = mobileMenu.querySelectorAll('a');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
        });
    });

    // Load award data
    loadAwardData();
});

// Global variable to store all awards data
let allAwardsData = [];

async function loadAwardData() {
    try {
        const response = await fetch('index.json');
        const data = await response.json();
        
        if (data.status && data.data) {
            allAwardsData = data.data; // Store all awards data
            const categorizedAwards = categorizeAwards([...allAwardsData]);
            renderAwardTables(categorizedAwards);
            // Initialize search functionality with empty search to show all
            filterAwards('');
        }
    } catch (error) {
        console.error('Error loading award data:', error);
    }
}

function categorizeAwards(awards) {
    const categorized = {};
    
    awards.forEach(award => {
        const type = award.type || 'Other';
        if (!categorized[type]) {
            categorized[type] = [];
        }
        categorized[type].push(award);
    });
    
    return categorized;
}

function addSearchInput() {
    // This function is no longer needed as we've moved the search input to the HTML
    // Keeping it as a placeholder in case it's referenced elsewhere
    return;
}

function filterAwards(searchTerm) {
    const tablesContainer = document.getElementById('tables-container');
    if (!tablesContainer) return;

    // If no search term, show all awards
    if (!searchTerm || searchTerm === '') {
        const categorizedAwards = categorizeAwards([...allAwardsData]);
        renderAwardTables(categorizedAwards);
        return;
    }

    // Filter awards based on search term
    const searchTermLower = searchTerm.toLowerCase();
    const filteredAwards = allAwardsData.filter(award => {
        // Convert date to a readable format for searching
        const awardDate = award.date ? new Date(award.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).toLowerCase() : '';

        return (
            (award.name && award.name.toLowerCase().includes(searchTermLower)) ||
            (award.type && award.type.toLowerCase().includes(searchTermLower)) ||
            (award.place && award.place.toLowerCase().includes(searchTermLower)) ||
            (award.venue && award.venue.toLowerCase().includes(searchTermLower)) ||
            (award.chief_guest && award.chief_guest.toLowerCase().includes(searchTermLower)) ||
            (award.guest_of_honour && award.guest_of_honour.toLowerCase().includes(searchTermLower)) ||
            (awardDate && awardDate.includes(searchTermLower))
        );
    });

    const categorizedAwards = categorizeAwards(filteredAwards);
    renderAwardTables(categorizedAwards);
}

function renderAwardTables(categorizedAwards) {
    const container = document.getElementById('tables-container');
    container.innerHTML = '';
    
    // Show message if no results found
    if (Object.keys(categorizedAwards).length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'text-center py-4 text-gray-500';
        noResults.textContent = 'No matching awards found.';
        container.appendChild(noResults);
        return;
    }
    
    Object.keys(categorizedAwards).forEach(type => {
        const awards = categorizedAwards[type];
        const table = createAwardTable(type, awards);
        container.appendChild(table);
    });
}

function createAwardTable(type, awards) {
    const section = document.createElement('div');
    section.className = 'mb-8';
    
    // Create type header in blue background with white text
    const typeHeader = document.createElement('div');
    typeHeader.className = 'bg-blue-900 text-white p-3 font-bold text-lg mb-0';
    typeHeader.textContent = type;
    section.appendChild(typeHeader);
    
    const table = document.createElement('table');
    table.className = 'w-full border-collapse';
    table.style.borderSpacing = '0';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-blue-900';
    
    const nameHeader = document.createElement('th');
    nameHeader.className = 'text-white text-left p-3 font-bold';
    nameHeader.textContent = 'Name';
    nameHeader.style.border = 'none';
    
    const dateHeader = document.createElement('th');
    dateHeader.className = 'text-white text-left p-3 font-bold';
    dateHeader.textContent = 'Date';
    dateHeader.style.border = 'none';
    
    const placeHeader = document.createElement('th');
    placeHeader.className = 'text-white text-left p-3 font-bold';
    placeHeader.textContent = 'Place';
    placeHeader.style.border = 'none';
    
    headerRow.appendChild(nameHeader);
    headerRow.appendChild(dateHeader);
    headerRow.appendChild(placeHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    // Add pagination controls with dropdown
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'flex justify-between items-center mt-4 bg-gray-100 p-3';
    
    // Left side: Rows per page dropdown
    const leftContainer = document.createElement('div');
    leftContainer.className = 'flex items-center space-x-2';
    
    const rowsLabel = document.createElement('span');
    rowsLabel.className = 'text-gray-700';
    rowsLabel.textContent = 'Rows per page:';
    
    const rowsDropdown = document.createElement('select');
    rowsDropdown.className = 'border border-gray-300 rounded px-2 py-1';
    rowsDropdown.innerHTML = `
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="${awards.length}">All</option>
    `;
    rowsDropdown.value = '5';
    
    leftContainer.appendChild(rowsLabel);
    leftContainer.appendChild(rowsDropdown);
    
    // Center: Page info and navigation
    const centerContainer = document.createElement('div');
    centerContainer.className = 'flex items-center space-x-2';
    
    const pageInfo = document.createElement('span');
    pageInfo.className = 'text-gray-700';
    
    const firstButton = document.createElement('button');
    firstButton.className = 'bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed';
    firstButton.innerHTML = '&laquo;';
    firstButton.disabled = true;
    
    const prevButton = document.createElement('button');
    prevButton.className = 'bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed';
    prevButton.innerHTML = '&lt;';
    prevButton.disabled = true;
    
    const nextButton = document.createElement('button');
    nextButton.className = 'bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed';
    nextButton.innerHTML = '&gt;';
    
    const lastButton = document.createElement('button');
    lastButton.className = 'bg-blue-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed';
    lastButton.innerHTML = '&raquo;';
    
    centerContainer.appendChild(firstButton);
    centerContainer.appendChild(prevButton);
    centerContainer.appendChild(pageInfo);
    centerContainer.appendChild(nextButton);
    centerContainer.appendChild(lastButton);
    
    paginationContainer.appendChild(leftContainer);
    paginationContainer.appendChild(centerContainer);
    
    section.appendChild(table);
    section.appendChild(paginationContainer);
    
    // Pagination state
    let currentPage = 1;
    let recordsPerPage = 5;
    let totalPages = Math.ceil(awards.length / recordsPerPage);
    
    function updateTable() {
        tbody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const pageAwards = awards.slice(startIndex, endIndex);
        
        pageAwards.forEach(award => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-300';
            
            const nameCell = document.createElement('td');
            nameCell.className = 'text-blue-600 p-3';
            nameCell.style.border = 'none';
            nameCell.textContent = award.name || '';
            
            const dateCell = document.createElement('td');
            dateCell.className = 'text-blue-600 p-3';
            dateCell.style.border = 'none';
            dateCell.textContent = award.date || '';
            
            const placeCell = document.createElement('td');
            placeCell.className = 'text-blue-600 p-3';
            placeCell.style.border = 'none';
            placeCell.textContent = award.place || '';
            
            row.appendChild(nameCell);
            row.appendChild(dateCell);
            row.appendChild(placeCell);
            tbody.appendChild(row);
        });
        
        // Update pagination controls
        totalPages = Math.ceil(awards.length / recordsPerPage);
        currentPage = Math.min(currentPage, totalPages);
        
        const startRecord = awards.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
        const endRecord = Math.min(currentPage * recordsPerPage, awards.length);
        
        pageInfo.textContent = `${startRecord}-${endRecord} of ${awards.length}`;
        
        firstButton.disabled = currentPage === 1;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || totalPages === 0;
        lastButton.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    firstButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage = 1;
            updateTable();
        }
    });
    
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });
    
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
        }
    });
    
    lastButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage = totalPages;
            updateTable();
        }
    });
    
    rowsDropdown.addEventListener('change', (e) => {
        recordsPerPage = parseInt(e.target.value);
        currentPage = 1;
        updateTable();
    });
    
    // Initial table render
    updateTable();
    
    return section;
}
