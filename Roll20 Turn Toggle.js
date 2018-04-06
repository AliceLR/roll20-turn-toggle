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

    var polldelay = 100;

    var charectertitle = "#initiativewindow div.ui-dialog-titlebar";
    var charecterlist = "#initiativewindow ul.characterlist";

    var fieldname = "span.name";
    var fieldinit = "span.initiative";
    var fieldblacklist = "span.editable, span.remove, input";

    var markstyle = "background-color: #9BF; font-weight: bold;";
    var markstyle0 = "background-color: #F9B; font-weight: bold;";

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

    function unmark(li)
    {
        var name = getname(li);
        if(name.length > 0) localStorage.removeItem("TURNTOGGLE:" + name);

        li.removeAttr("style");
    }

    function mark(li)
    {
        var name = getname(li);
        var init = getinit(li);
        if(name.length > 0) localStorage.setItem("TURNTOGGLE:" + name, true);

        // HACK: style allies and enemies differently
        if(init == 0)
            li.attr("style", markstyle0);

        else
            li.attr("style", markstyle);
    }

    function markall()
    {
        $(charecterlist).find("li").each(function () {
            if(!isreset($(this)))
                mark($(this));
        });
    }

    function updatemark(li)
    {
        var name = getname(li);
        if(name.length >= 0)
        {
            var marked = localStorage.getItem("TURNTOGGLE:" + name);
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

    window.setInterval(function() {

        var lis = $(charecterlist).find("li");
        var abort = 0;

        // HACK: Stop updating during a drag event.
        lis.each(function () {
            if(!abort)
                if($(this).css("top") > "0px")
                    abort = 1;
        });
        if(abort) return;

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
                    markall();
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

    }, polldelay);

    console.log("Roll20 Turn Toggle successfully didn't blow up");
})();
