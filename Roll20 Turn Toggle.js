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
    var fieldblacklist = "span.editable, span.remove, input";

    var markstyle = "background-color: #AAF; color: #CCF; font-weight: bold;";

    function getname(li)
    {
        return li.find(fieldname).text();
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
        if(name.length > 0) localStorage.setItem("TURNTOGGLE:" + name, true);

        li.attr("style", markstyle);
    }

    function unmarkall()
    {
        $(charecterlist).find("li").each(function () {
            unmark($(this));
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
        /*
        var _charectertitle = $(charectertitle);

        _charectertitle.unbind("click");
        _charectertitle.click(function () {
            unmarkall()
        })
        */

        $(charecterlist).find("li").each(function () {
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
                    unmarkall();
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
