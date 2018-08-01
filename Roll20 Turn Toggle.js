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
    var charecterlist = "#initiativewindow ul.characterlist";

    var fieldname = "span.name";
    var fieldinit = "span.initiative";
    var fieldblacklist = "span.editable, span.remove, input";

    var markstyleally = "background-color: #9BF; font-weight: bold;";
    var markstyleenemy = "background-color: #F9B; font-weight: bold;";

    var buttonstylediv = "overflow: hidden; margin-top: 2px; height: 28px";
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

    function getid(li)
    {
        return li.attr("data-tokenid");
    }

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

    function ismarked(li)
    {
        var id = getid(li);
        if(id.length > 0) return getmarkedvalue(id);
        return null;
    }

    function unmark(li)
    {
        var id = getid(li);
        if(id.length > 0) removemarkedvalue(id);

        li.removeAttr("style");
    }

    function mark(li)
    {
        var id = getid(li);
        if(id.length > 0) setmarkedvalue(id);

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
            var marked = ismarked(li);
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
        var b = $('<button type="button" role="button" aria-disabled="true" />');
        b.addClass("ui-button ui-widget ui-state-default ui-corner-all");
        b.addClass("ui-button-text-only bigbuttonwithicons initbutton");
        b.attr("style", style);
        b.attr("id", id);
        b.text(text);
        return b;
    }

    function injectbuttons(initdiv)
    {
        var buttondiv = initdiv.parent();
        var buttonlist = buttondiv.find("div .initbutton");
        if(buttonlist.length == 0)
        {
            var dv = $('<div/>');
            dv.attr("style", buttonstylediv);
            dv.insertAfter(initdiv);
            dv.append(button("Mark", "markally", buttonstyleally));
            dv.append(button("Clear", "clearally", buttonstyleally));
            dv.append(button("Mark", "markenemy", buttonstyleenemy));
            dv.append(button("Clear", "clearenemy", buttonstyleenemy));
            dv.on("click", "#markally", markallies);
            dv.on("click", "#markenemy", markenemies);
            dv.on("click", "#clearally", unmarkallies);
            dv.on("click", "#clearenemy", unmarkenemies);
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
