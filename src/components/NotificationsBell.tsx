import { Bell, Check, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationsBell = () => {
  const { items, unreadCount, markAsRead, markAllAsRead, remove } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display text-sm font-semibold">Notifiche</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllAsRead()}
            >
              <Check size={12} className="mr-1" /> Segna tutte
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nessuna notifica.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Body = (
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium truncate">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: it })}
                    </p>
                  </div>
                );
                return (
                  <li
                    key={n.id}
                    className={`flex items-start gap-2 px-4 py-3 hover:bg-muted/50 ${
                      !n.read_at ? "bg-primary/5" : ""
                    }`}
                  >
                    {!n.read_at && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden />
                    )}
                    {n.link ? (
                      <Link
                        to={n.link}
                        className="flex-1 min-w-0"
                        onClick={() => !n.read_at && markAsRead(n.id)}
                      >
                        {Body}
                      </Link>
                    ) : (
                      <button
                        className="flex-1 min-w-0 text-left"
                        onClick={() => !n.read_at && markAsRead(n.id)}
                      >
                        {Body}
                      </button>
                    )}
                    <button
                      onClick={() => remove(n.id)}
                      aria-label="Elimina notifica"
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;
