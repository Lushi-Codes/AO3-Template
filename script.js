const phoneShell = document.getElementById('phoneShell');
const homeScreen = document.querySelector('.home-screen');
const notesScreen = document.getElementById('notesAppScreen');
const notesAppContent = document.getElementById('notesAppContent');
const notesDetails = document.querySelector('.app-box[data-app="notes"]');
const backButton = document.getElementById('backToHome');

  function showHomeScreen() {
    homeScreen.classList.add('is-active');
    notesScreen.classList.remove('is-active');
    phoneShell.classList.remove('is-notes-view');
    if (notesDetails) {
      notesDetails.open = false;
    }
  }

  function showNotesScreen() {
    if (!notesAppContent.innerHTML) {
      const sourceScreen = notesDetails.querySelector('.screen-ui');
      const notesClone = sourceScreen.cloneNode(true);
      const header = notesClone.querySelector('.screen-header');

      if (header) {
        header.innerHTML = '<span>📝 Notes</span><span></span>';
      }

      notesAppContent.innerHTML = '';
      notesAppContent.appendChild(notesClone);
    }

    homeScreen.classList.remove('is-active');
    notesScreen.classList.add('is-active');
    phoneShell.classList.add('is-notes-view');
  }

  if (notesDetails) {
    notesDetails.addEventListener('click', function (event) {
      const summary = event.target.closest('summary');
      if (!summary) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      showNotesScreen();
    });
  }

  if (backButton) {
    backButton.addEventListener('click', showHomeScreen);
  }
