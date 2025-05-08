(function () {
  // create notification div
  let notification = document.createElement("div");
  document.body.appendChild(notification);
  notification.setAttribute(
    "style",
    `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translate(-50%, 0%);

      padding: 5px 15px;
      font-size: 14px;
      
      border-radius: 80px;

      background: rgb(0, 0, 0);
      color: white;

      display: flex;
      align-items: center;
      justify-content: center;

      transition: 0.3s;
      opacity: 0.0;
    `
  );
  // notification appear/disappear timeoutID
  let notificationAppearTimeoutID = null;

  if (!window.jQuery) {
    // load jquery js
    let script = document.createElement("SCRIPT");
    script.src =
      "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  // poll for jQuery to come into existence
  let checkReady = function (cb) {
    window.jQuery
      ? cb()
      : window.setTimeout(function () {
        checkReady(cb);
      }, 20);
  };

  // start polling...
  checkReady(() => {
    (async () => {
      /*
       *********************************************** 1. Now JQuery is loaded ********************************************************
       *********************************************** 2. Fetch the svg icons from /icons folder **************************************
       *********************************************** 3. This is for the GitHub Page using api.github.com/repos/... ******************
       */

      // variables for whole icon category/icons
      const icons = []

      // find the /icons folder from the main repository
      const repositoryUrl = `https://api.github.com/repos/rnbwdev/raincons/git/trees/main`;
      const repositoryContent = await fetch(repositoryUrl).then((res) => res.json());
      const iconsFolderObj = repositoryContent.tree.filter(
        (node) => node.type !== "blob"
      );

      // get all of the icons
      const iconsFolderContent = await fetch(iconsFolderObj[0].url).then((res) => res.json());
      iconsFolderContent.tree.forEach((node) => {
        if (node.path.includes(".")) {
          if (node.path.search(".svg") != -1) {
            icons.push(node.path.substring(0, node.path.length - 4))
          }
        }
      });

      // build the content html for the icon-categories/icons
      let contentHtml = ``;
      contentHtml += `
                <div class="gap-m column">
                  <!-- SVGIcons -->
                  <div class="gap-l box-l" style="flex-wrap: wrap;">`;
      icons.map(icon => {
        contentHtml += `
                    <svg-icon class="icon-xs" html="${icon}">
                      ${icon}
                    </svg-icon>
                  `;
      });

      contentHtml += `
                  </div>
                </div>
                `;

      // append the built html to the #content
      $("#content").append(contentHtml);

      // add event handlers after html page is completed
      // filter when keyboard is released
      $("#searchInput").on("keyup", function (event) {
        // display CSS constants
        const NONE = "none";
        const BLOCK = "block";

        // variables
        let total_icons = document.getElementsByTagName("svg-icon");
        let search_content = $(this).val();

        if (search_content === "") {
          // show all icons
          for (let i = 0; i < total_icons.length; i++) {
            $(total_icons[i]).css("display", BLOCK);
          }
        } else {
          // show matched icons except .post-icon
          for (let i = 0; i < total_icons.length; i++) {
            if ($(total_icons[i]).hasClass("post-icon")) {
              continue;
            }
            let item = total_icons[i].getAttribute('html');
            if (item.search(search_content) == -1) {
              $(total_icons[i]).css("display", NONE);
            } else {
              $(total_icons[i]).css("display", BLOCK);
            }
          }
        }
      });

      // copy svg-icon iconName to clipboard on clicking
      $("svg-icon:not(.post-icon)").click(function () {
        // get iconName from svg-icon
        let iconName = $(this)[0].getAttribute('html')
        let iconHtml = `<svg-icon>${iconName}</svg-icon>`;

        // copy iconName to clipboard
        let dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = iconHtml;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);

        // show notification
        clearTimeout(notificationAppearTimeoutID);
        $(notification).css("opacity", "1.0");
        notification.innerHTML = `Copied - &lt;svg-icon&gt;${iconName}&lt;/svg-icon&gt;`;

        // hide notification after 3s delay
        notificationAppearTimeoutID = setTimeout(() => {
          $(notification).css("opacity", "0.0");
        }, 3 * 1000);
      });
    })();
  });
})();
