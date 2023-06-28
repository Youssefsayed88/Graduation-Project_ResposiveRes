function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab content
    const selectedContent = document.getElementById(tabName);
    selectedContent.classList.add('active');

    // Add active class to the clicked tab
    const selectedTab = document.querySelector(`.tab[data-tab="${tabName}"]`);
    selectedTab.classList.add('active');
}

// Set the initial active tab when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set the tab name of the initial active tab here
    const initialTab = 'text';
    showTab(initialTab);
});
