document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('.sidebar a');
    const sections = document.querySelectorAll('.section');
    
    // Initially show only the first section
    sections.forEach(section => section.style.display = 'none'); 
    document.getElementById('profile').style.display = 'block';
  
    // Set up event listeners for the sidebar links
    links.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
  
        // Hide all sections
        sections.forEach(section => section.style.display = 'none');
  
        // Show the clicked section
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.style.display = 'block';
        }
      });
    });
  });
  