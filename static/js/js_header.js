document.addEventListener("DOMContentLoaded", function() {
  // Sidebar toggle functionality
  var sidebar = document.querySelector('.sidebar');
  var sidebarBtn = document.querySelector('.sidebar-btn');

  function toggleSidebar() {
    sidebar.classList.toggle('visible');
    sidebarBtn.classList.toggle('hidden');
  }

  sidebarBtn.addEventListener('click', toggleSidebar);

  // Close sidebar when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target !== sidebar && event.target.parentNode !== sidebar && event.target !== sidebarBtn) {
      sidebar.classList.remove('visible');
      sidebarBtn.classList.remove('hidden');
    }
  });


});
