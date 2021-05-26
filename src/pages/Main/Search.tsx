import {
  IonAvatar,
  IonContent,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from "@ionic/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import useCuppaZeeData from "../../utils/useCuppaZeeData";
import useMunzeeData from "../../utils/useMunzeeData";
import { useLazySearch } from "../../utils/useSearch";
import "./Search.css";
import Fuse from "fuse.js";
import types from "@cuppazee/types";
import { CZTypeImg } from "../../components/CZImg";

function Search() {
  const pageTitle = "Search";
  const [value, search, onValue] = useLazySearch(200);
  const [filter, setFilter] = useState("all");

  const users = useMunzeeData({
    endpoint: "user/find",
    params: { text: search },
    options: { enabled: !!search, keepPreviousData: true },
  });
  const clans = useCuppaZeeData<{ data: { clan_id: number; name: string; tagline: string }[] }>({
    endpoint: "clan/list",
    params: { format: "list" },
  });

  const searchbarRef = useRef<HTMLIonSearchbarElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(
        [
          ...(filter === "all" || filter === "clans" ? clans.data?.data ?? [] : []),
          // ...(filter === "all" || filter === "types" ? types.types : []),
          // ...(filter === "all" || filter === "types" ? types.categories : []),
          ...(filter === "all" || filter === "players" ? users.data?.data?.users ?? [] : []),
        ],
        {
          keys: ["name", "username", "icon", "id", "user_id", "clan_id"],
        }
      ),
    [clans.dataUpdatedAt, users.dataUpdatedAt, filter]
  );
  const results = useMemo(() => fuse.search(search).map(i => i.item), [fuse, search]);

  useEffect(() => {
    setTimeout(() => searchbarRef.current?.setFocus(), 500);
  }, [])

  return (
    <>
      <Header title={pageTitle}>
        <IonToolbar>
          <IonSearchbar
            defaultValue={value.current}
            onIonChange={ev => onValue(ev.detail.value ?? "")}
            ref={searchbarRef}
          />
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value ?? "")}>
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="players">
              <IonLabel>Players</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="clans">
              <IonLabel>Clans</IonLabel>
            </IonSegmentButton>
            {/* <IonSegmentButton value="types">
              <IonLabel>Types</IonLabel>
            </IonSegmentButton> */}
          </IonSegment>
        </IonToolbar>
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
                  <IonItem key={`user_${i.user_id}`} routerLink={`/user/${i.username}`}>
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
                  <IonItem key={`clan_${i.clan_id}`} routerLink={`/clan/${i.clan_id}`}>
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
              }// else {
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
    </>
  );
}

export default Search;
