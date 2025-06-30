@extends('layouts.admin')

@section('title', 'Tiendas / Sucursales')

@section('content')
    <div id="stores-admin"></div>
@endsection

@section('scripts')
    @vite('resources/js/Admin/Stores.jsx')
    <script>
        const ubigeos = @json($ubigeos);
        $(function() {
            ReactAppend('stores-admin', 'Stores', { ubigeos });
        });
    </script>
@endsection
