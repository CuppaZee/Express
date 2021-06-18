import { IonLabel, IonModal, IonPage, IonSearchbar, IonContent, IonList, IonRefresher, IonRefresherContent, IonItem, IonAvatar, IonImg } from "@ionic/react";
import "./Search.css";
import Header from "../Header";
import { useEffect, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import { useTranslation } from "react-i18next";
import { useLazySearch } from "../../utils/useSearch";
import useMunzeeData from "../../utils/useMunzeeData";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import { addUserIDs } from "../../utils/useUserID";

export interface SearchModalProps {
  filter: "all" | "clans" | "players"
  open: boolean;
  onClose(): void;
  onSelect(value: { user_id: number; username: string } | { clan_id: number; name: string; tagline: string }): void;
}

export default function SearchModal({ open, onClose, onSelect, filter = "all" }: SearchModalProps) {
  const { t } = useTranslation();
  const pageTitle = t("pages:tools_search");
  const [value, search, onValue] = useLazySearch(200);

  const users = useMunzeeData({
    endpoint: "user/find",
    params: { text: search },
    options: { enabled: !!search, keepPreviousData: true },
  });
  useEffect(() => {
    if (users.data?.data) {
      addUserIDs(users.data.data.users.map(i => [i.username, Number(i.user_id)]));
    }
  }, [users.dataUpdatedAt]);
  const clans = useCuppaZeeData<{ data: { clan_id: number; name: string; tagline: string }[] }>({
    endpoint: "clan/list",
    params: { format: "list" },
    options: {
      enabled: open && filter !== "players"
    }
  });

  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(
        [
          ...(filter === "all" || filter === "clans" ? clans.data?.data ?? [] : []),
          // ...(filter === "all" || filter === "types" ? db.types : []),
          // ...(filter === "all" || filter === "types" ? db.categories : []),
          ...(filter === "all" || filter === "players" ? users.data?.data?.users ?? [] : []),
        ],
        {
          keys: ["name", "username", "icon", "id", "user_id", "clan_id"],
        }
      ),
    [clans.dataUpdatedAt, users.dataUpdatedAt, filter]
  );
  const results = useMemo(() => fuse.search(search).map(i => i.item), [fuse, search]);

  return (
    <IonModal onDidPresent={() => {
      searchbarRef.current?.setFocus();
      setTimeout(() => searchbarRef.current?.setFocus(), 300);
    }} swipeToClose={true} isOpen={open} backdropDismiss={true} onDidDismiss={onClose}>
      <IonPage>
        <Header title={pageTitle}>
          <IonSearchbar
            placeholder={t("search:title")}
            defaultValue={value.current}
            onIonChange={ev => onValue(ev.detail.value ?? "")}
            ref={searchbarRef}
          />
        </Header>
        <IonContent>
          <IonRefresher
            slot="fixed"
            onIonRefresh={ev => {
              Promise.all([clans.refetch(), users.refetch()]).then(() => ev.detail.complete());
            }}>
            <IonRefresherContent />
          </IonRefresher>
          <div className="search-content">
            <IonList>
              {results.slice(0, 50).map(i => {
                if ("user_id" in i) {
                  return (
                    <IonItem
                      key={`user_${i.user_id}`}
                      onClick={() => {
                        onSelect({ user_id: Number(i.user_id), username: i.username });
                        onValue("");
                      }}>
                      <IonAvatar slot="start">
                        <IonImg
                          src={`https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                            i.user_id
                          ).toString(36)}.png`}
                        />
                      </IonAvatar>
                      <IonLabel>{i.username}</IonLabel>
                    </IonItem>
                  );
                } else if ("clan_id" in i) {
                  return (
                    <IonItem key={`clan_${i.clan_id}`} onClick={() => {
                      onSelect({ clan_id: i.clan_id, name: i.name, tagline: i.tagline });
                      onValue("");
                    }}>
                      <IonAvatar slot="start">
                        <IonImg
                          src={`https://munzee.global.ssl.fastly.net/images/clan_logos/${Number(
                            i.clan_id
                          ).toString(36)}.png`}
                        />
                      </IonAvatar>
                      <IonLabel>{i.name}</IonLabel>
                    </IonItem>
                  );
                } // else {
                //   return (
                //     <IonItem key={`type_${i.id.toString()}`} routerLink={`/type/${i.name}`}>
                //       <CZTypeImg img={i.icon} slot="start" className="search-type-image" />
                //       <IonLabel>{i.name}</IonLabel>
                //     </IonItem>
                //   );
                // }
              })}
            </IonList>
          </div>
        </IonContent>
      </IonPage>
    </IonModal>
  );
}
