// ==UserScript==
// @name         Roll20 Turn Toggle
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Toggles the background color of characters in the turn order and remembers their colors.
// @author       Lachesis
// @match        https://app.roll20.net/editor/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var initiativewindow = "#initiativewindow";
    var initiativebuttons = "#initiativewindow div .ui-dialog-buttonset";
    var charectertitle = "#initiativewindow div.ui-dialog-titlebar";
    var charecterlist = "#initiativewindow ul.characterlist";

    var fieldname = "span.name";
    var fieldinit = "span.initiative";
    var fieldblacklist = "span.editable, span.remove, input";

    var markstyleally = "background-color: #9BF; font-weight: bold;";
    var markstyleenemy = "background-color: #F9B; font-weight: bold;";

    var buttonstyleally = "background-image: linear-gradient(#58D,#358); color: #FFF; font-weight: bold;";
    var buttonstyleenemy = "background-image: linear-gradient(#D58,#835); color: #FFF; font-weight: bold;";

    /**
     * Persistent storage functions
     */

    function getmarkedvalue(name)
    {
        return localStorage.getItem("TURNTOGGLE:" + name);
    }

    function setmarkedvalue(name)
    {
        localStorage.setItem("TURNTOGGLE:" + name, true);
    }

    function removemarkedvalue(name)
    {
        localStorage.removeItem("TURNTOGGLE:" + name);
    }

    /**
     * Init list element management functions.
     */

    function getname(li)
    {
        return li.find(fieldname).text();
    }

    function getinit(li)
    {
        return li.find(fieldinit).text();
    }

    function isreset(li)
    {
        return getname(li) == "Reset";
    }

    function isally(li)
    {
        return getinit(li) != 0;
    }

    function isenemy(li)
    {
        return getinit(li) == 0;
    }

    function unmark(li)
    {
        var name = getname(li);
        if(name.length > 0) removemarkedvalue(name);

        li.removeAttr("style");
    }

    function mark(li)
    {
        var name = getname(li);
        if(name.length > 0) setmarkedvalue(name);

        if(isally(li))
            li.attr("style", markstyleally);

        else if(isenemy(li))
            li.attr("style", markstyleenemy);
    }

    function iterateinit(fn, filter=null)
    {
        $(charecterlist).find("li").each(function () {
            var li = $(this);
            if(!isreset(li))
                if(filter === null || filter(li))
                    fn(li);
        });
    }

    function markallies()
    {
        iterateinit(mark, isally);
    }

    function markenemies()
    {
        iterateinit(mark, isenemy);
    }

    function unmarkallies()
    {
        iterateinit(unmark, isally);
    }

    function unmarkenemies()
    {
        iterateinit(unmark, isenemy);
    }

    function updatemark(li)
    {
        var name = getname(li);
        if(name.length >= 0)
        {
            var marked = getmarkedvalue(name);
            if(marked !== null)
            {
                mark(li);
            }
            else
            {
                unmark(li);
            }
        }
    }

    /**
     * Update the initiative list.
     */
    function button(text, id, style)
    {
        return `<button type="button" style="`+ style +`" id="`+ id +`"
          class="ui-button ui-widget ui-state-default ui-corner-all
          ui-button-text-only initbutton bigbuttonwithicons" role="button" aria-disabled="true">`
          + text + `</button>`;
    }

    function injectbuttons(buttondiv)
    {
        var buttonlist = buttondiv.find(".initbutton");
        if(buttonlist.length == 0)
        {
            buttondiv.append(button("Mark", "markally", buttonstyleally));
            buttondiv.append(button("Clear", "clearally", buttonstyleally));
            buttondiv.append(button("Mark", "markenemy", buttonstyleenemy));
            buttondiv.append(button("Clear", "clearenemy", buttonstyleenemy));
            buttondiv.on("click", "#markally", markallies);
            buttondiv.on("click", "#markenemy", markenemies);
            buttondiv.on("click", "#clearally", unmarkallies);
            buttondiv.on("click", "#clearenemy", unmarkenemies);
        }
        else buttonlist.each(function () {
            // This sometimes gets automatically added, corrupting the button text.
            $(this).removeClass("pictos");
        });
    }

    function updateinit()
    {
        var lis = $(charecterlist).find("li");
        var abort = 0;

        // HACK: Stop updating during a drag event.
        lis.each(function () {
            if(!abort)
                if($(this).css("top") > "0px")
                    abort = 1;
        });
        if(abort) return;

        // Inject turn order management buttons
        injectbuttons($(initiativewindow));

        // Inject styling and click listeners into the initiative list.
        lis.each(function () {
            var _li = $(this);
            updatemark(_li);

            _li.unbind("click");
            _li.click(function (event) {
                // Prevent unwanted fields from triggering this effect.
                var target = $(event.target);
                if(target.is(fieldblacklist)) return;

                var li = target.closest("li");

                if(isreset(li))
                {
                    iterateinit(mark);
                }
                else

                if(li.attr("style"))
                {
                    unmark(li);
                }
                else
                {
                    mark(li);
                }
            });
        });
    }

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var config = { childList: true, characterData: true, attributes: true, subtree: true };
    var observer = null;

    function attach()
    {
        if(observer !== null)
        {
            $(initiativewindow).each(function () {
                observer.observe(this, config);
            });
        }
    }

    $(document).ready(function() {
        console.log('Creating mutation listener...');
        observer = new MutationObserver(function(mutations) {
            observer.disconnect();
            updateinit();
            attach();
        });

        attach();
    });

    console.log("Roll20 Turn Toggle successfully didn't blow up");
})();
