<?php

namespace Tualo\Office\RPTStats\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\IRoute;


class Route implements IRoute
{
    public static function register()
    {


        BasicRoute::add('/rptstats/send', function ($matches) {
            $db = App::get('session')->getDB();


            try {
                // $db->direct('delete from  cmp_mail_calls where id <date_add(now(),interval -7 day) ;');
            } catch (\Exception $e) {
            }
        }, array('get'), true);
    }
}
