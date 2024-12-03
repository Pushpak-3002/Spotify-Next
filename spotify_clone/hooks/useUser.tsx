import { User, useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react";
import { Subscription, UserIdentity } from "@supabase/supabase-js";
import { create } from "domain";
import { useEffect, useState } from "react";
import { createContext } from "vm";

type UserContextType = {
    accessToken: string | null;
    user: User|null;
    userdetails:UserIdentity|null;
    isloading: boolean;
    subscription: Subscription|null;
};

/*export const UserContext = createContext<UserContextType|undefined>(
    undefined
);*/

export interface Props {
    [propName:string]: any ;
} 

export const MyUserContextProvider = (props: Props)=>{
    const {
        session,
        isLoading: isloadingUser,
        supabaseClient: supabase
    } = useSessionContext();
    const user = useSupaUser();
    const accessToken = session?.access_token ?? null ;
    const [isLoadingData,setIsLoadingData]= useState(false);
    const [UserDetails, setUserDetails] = useState<UserIdentity | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    const getUserDetails = ()=> supabase.from('users').select('*').single();
    const getSubscription = ()=>
        supabase
            .from('subscription')
            .select('*,prices(*,products(*))')
            .in('status',['trialing','active'])
            .single();


        useEffect(()=>{
            if(user && !isLoadingData && !UserDetails && !subscription){
                setIsLoadingData(true);

                Promise.allSettled([getUserDetails(),getSubscription()]).then(
                    (results)=>{
                        const userDetailsPromise = results[0];
                        const subscriptionPromise = results[1];

                        if(userDetailsPromise.status === "fulfilled"){
                            setUserDetails(userDetailsPromise.value.data as UserIdentity)
                        }
                    }
                )
            }
        },[])
}


